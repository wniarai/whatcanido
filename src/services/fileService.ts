import fs from "node:fs";
import {ReportFile, sequelize} from "../models/reportfile";
import { MultipartFile } from "@fastify/multipart";
import {generateNewDocx, parseNewHtml} from "../utils/trasnfer-utils";
import { FileData } from "@/common/interfaces";
import { v1 as uuidv1 } from "uuid";
import { pipeline } from 'stream/promises';
import path from "path";
import console from "console";
import {Op} from "sequelize";
import {DataCenterHttpException} from "@/errors/http-errors";
import {
    FileAlreadyExistsException, FileDeleteException, FileNotFoundException,
    FileSaveException,
    FileTypeUnspoortException,
    FileUploadException
} from "@/errors/files";

type DBTYPE = 'g100' | 'e100' | 'pg' | 'og' | 'panwei';

const ensureDirectoryExistence = (dirPath: string): void => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

async function uploadFile(fileData: MultipartFile, userId: string, dbType: DBTYPE): Promise<boolean> {
    if (!fileData) {
        throw new FileUploadException();
    }
        const fileType: 'html' | 'docx' = await getFileExtension(fileData.filename);
        const fileName = fileData.filename.split('.').slice(0, -1).join('.') || '';
        const filePath = `source/${dbType}/htmlfiles/${userId}/`;
        const tempFilePath = path.join(filePath, `${fileName}.${fileType}.temp`);
        const finalFilePath = path.join(filePath, `${fileName}.${fileType}`);

        const newFileData: FileData = {
            id: '', //不传,数据库自动生成有序uuid -> binary
            filename: fileName,
            path: filePath,
            user_id: userId,
            created_at: new Date(),
            file_type: fileType,
            is_deleted: false,
            db_type: dbType
        };

        ensureDirectoryExistence(filePath);

        // 将文件写入临时位置
        await pipeline(
            fileData.file,
            fs.createWriteStream(tempFilePath)
        );

        // 保存数据库记录
        if (await findReportFileIsExists(userId,fileName)){
            await fs.promises.unlink(tempFilePath).catch(() => { /* 忽略删除错误 */ });
            throw new FileAlreadyExistsException(fileName,userId)
        }
        if (await saveOne(newFileData)) {
            try {
                // 数据库保存成功，重命名临时文件为最终文件
                await fs.promises.rename(tempFilePath, finalFilePath);
                // const element = await parseNewHtml(finalFilePath);
                return true;
            } catch (error) {
                // 文件操作失败，删除数据库记录
                await deleteOne(newFileData.id);
                await fs.promises.unlink(tempFilePath).catch(() => { /* 忽略删除错误 */ });
                throw new FileSaveException(fileName)
            }
        } else {
            // 数据库保存失败，删除临时文件
            await fs.promises.unlink(tempFilePath).catch(() => { /* 忽略删除错误 */ });
            throw new FileSaveException(fileName)
        }
}

async function getFileExtension(filename: string): Promise<'html' | 'docx'> {
    const parts = filename.split('.');
    const extension = parts.length > 1 ? parts[parts.length - 1] : '';

    if (extension === 'html' || 'docx') {
        return extension as 'html' | 'docx';
    }
    throw new FileTypeUnspoortException(extension);
}

async function deleteFile(fileId: string): Promise<boolean> {
    let reportFile;

    try {
        try {
            reportFile = await ReportFile.findOne({
                where: sequelize.literal('id = UUID_TO_BIN(:fileId,1)'),
                replacements: { fileId },
                limit: 1
            });
        }catch (error){
            console.error(error)
            throw new FileNotFoundException(fileId,'id');
        }

        if (!reportFile) {
            return false;
        }

        const deleteRow = await ReportFile.destroy({
            where: sequelize.where(sequelize.fn('BIN_TO_UUID',sequelize.col('id'),1),fileId)
        });

        if (deleteRow === 0) {
            return false;
        }

        const filePath = path.join(reportFile.get().path, `${reportFile.get().filename}.${reportFile.get().file_type}`);
        console.log(filePath)
        await fs.promises.unlink(filePath).catch(() => { /* 忽略删除错误 */ });

        return true; // 返回成功
    } catch (error) {
        console.log('temp2')
        throw new FileDeleteException(fileId);
    }
}

async function saveOne(fileData: FileData): Promise<boolean> {
    try {
        if (await findReportFileIsExists(fileData.user_id,fileData.filename)){
            throw new FileAlreadyExistsException(fileData.filename,fileData.user_id)
        }

        await ReportFile.create({
            filename: fileData.filename,
            path: fileData.path,
            user_id: sequelize.fn('UUID_TO_BIN',fileData.user_id,1),
            create_at: fileData.created_at,
            file_type: fileData.file_type,
            is_deleted: fileData.is_deleted,
            db_type: fileData.db_type
        });
        return true;
    } catch (e) {
        console.log(e)
        throw new FileSaveException(fileData.filename);
    }
}
// todo UUID_TO_BIN
async function deleteOne(fileId: string): Promise<boolean> {
    try {
        await ReportFile.destroy({
            where: { id: fileId }
        });

        return true;
    } catch (e) {
        throw new FileDeleteException(fileId);
    }
}

/**
 * return 文件存在 ? true : false
 * @param userId
 * @param fileName
 */
async function findReportFileIsExists(userId:string,fileName:string):Promise<boolean>{
    try {
        const reportFile = await ReportFile.findOne({
            where: {
                [Op.and]: [
                    sequelize.literal('user_id = UUID_TO_BIN(:userId, 1)'),
                    {
                        filename: {
                            [Op.eq]: fileName
                        }
                    }
                ]
            },
            replacements: {
                userId: userId
            },
            limit: 1
        });

        if (reportFile === null) {
            return false;
        }else{
            return true;
        }

    }catch (error){
        console.error(error);
        return false;
    }
}


async function transferFile(fileId:string){
    const reportFile = await ReportFile.findOne({
        attributes:[
            [sequelize.fn('BIN_TO_UUID',sequelize.col('id'),1),'id'],
            'filename',
            'path',
            [sequelize.fn('BIN_TO_UUID',sequelize.col('user_id'),1),'user_id'],
            'db_type'
        ],
        where: sequelize.literal('id = UUID_TO_BIN(:fileId,1)'),
        replacements: { fileId },
        limit: 1
    });

    const filePath = reportFile?.get().path + reportFile?.get().filename + '.html'

    const ElementsSummaries = await parseNewHtml(filePath)


    const docxFilePath =  'source/g100/docxfiles/' + reportFile?.get().user_id + '/'

    ensureDirectoryExistence(docxFilePath);

    console.log(ElementsSummaries.get('dbversion'))


    await generateNewDocx(ElementsSummaries.get('data'),reportFile?.get().user_id,reportFile?.get().db_type,reportFile?.get().filename,'qwe')

    // console.log(reportFile)
}






export { uploadFile, getFileExtension,deleteFile,transferFile};
