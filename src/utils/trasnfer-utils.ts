import fs from 'fs';
import {promises} from "fs";
import * as cheerio from 'cheerio';
import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"
import path from "path";
import file from "@/routes/file";
import {FileNotFoundException} from "@/errors/files";


type NewReportElement = { id: string; result: string; detail: string; suggestion: string; type: 'DB'|'OS'; name: string; };
type NewReportTableInfo = { type: 'DB'|'OS'; result: string };
type DBTYPE = 'g100' | 'e100' | 'pg' | 'og' | 'panwei'

export async function parseNewHtml(filePath: string): Promise<Map<string,any>> {
    try {
        if (! await fileExists(filePath)){
            throw new FileNotFoundException(filePath,'filename')
        }
        const data = await promises.readFile(filePath, 'utf8');
        const $ = cheerio.load(data);

        const resultMap = new Map<string, NewReportTableInfo>();

        const ElementsSummaries = new Map<string,any>();

        // todo 巡检环境基本信息(DB VERSION)

        $('#importance_info tr').each((_, element) => {
            const type = $(element).find('td:nth-child(1)').text().trim();
            let value = $(element).find('td:nth-child(2)').text().trim();
            if ( type === 'DB VERSION'){
                if (value.startsWith('(')){
                    let newStr = value.replace(/\(.*?\) compiled at.*? commit (\d+).*$/, "Vastbase G100 V2.2 (Build 10) commit $1");
                    // console.log(newStr)
                }
                ElementsSummaries.set('dbversion',type)
            }
        });

        // 顶部表格获取结果
        $('#result_info tr:gt(0)').each((_, element) => {
            const type = $(element).find('td:nth-child(3)').text().split(' ')[0] as 'DB' | 'OS';
            const result = $(element).find('td:nth-child(2) div').text().trim();
            const href = $(element).find('td:last-child a').attr('href');
            const id = href?.substring(1);
            if (id && result && (type === 'DB' || type === 'OS')) {
                resultMap.set(id, { result, type });
            }
        });

        const NewReportElements: NewReportElement[] = [];

        // 获取巡检项信息
        for (const element of $('h3').toArray()) {
            const name = $(element).text();
            const id = $(element).attr('id');
            if (!id) continue;

            const detail = $(element).next('table').find('.detail-text-get').text().trim();
            const suggestion = $(`#${id}-suggestion`).closest('.panel').find('.panel-body').text().trim();
            const NewReportTableInfo = resultMap.get(id);

            if (!NewReportTableInfo || !detail || !suggestion) continue;

            NewReportElements.push({
                id,
                result: NewReportTableInfo.result,
                detail,
                suggestion,
                type: NewReportTableInfo.type,
                name
            });
        }

        // const typeMap = NewReportElements.reduce((map, element) => {
        //     if (!element.type) return map;
        //     if (!map[element.type]) {
        //         map[element.type] = [];
        //     }
        //     map[element.type].push(element);
        //     return map;
        // }, {} as { [key: string]: NewReportElement[] });
        //
        // const DBElements = typeMap['DB'] || [];
        // const OSElements = typeMap['OS'] || [];
        // console.log(NewReportElements)
        ElementsSummaries.set('info',NewReportElements)

        return ElementsSummaries;
    } catch (err) {
        console.error('Error reading file:', err);
        throw err;
    }
}

export async function generateNewDocx(elements:NewReportElement[],userId:string,dbtype:DBTYPE,fileName:string,clientName:string){
    try {
        const doc = new Docxtemplater(await loadTemplate('../../source/template/' + dbtype + '/' + dbtype + '_template.docx'))
        const currentDate = new Date()

        // 基础
        const data = {
            client_name: clientName,
            year: currentDate.getFullYear(),
            month: currentDate.getMonth(),
            day: currentDate.getDay()
        }
        // 报告
        doc.setData(data)

        doc.render();

        const buf = doc.getZip().generate({ type: 'nodebuffer' })

        fs.writeFileSync('source/g100/docxfiles/' +userId+ '/【' + clientName + '】' + fileName + '.docx',buf)

    }catch (e){
        console.log(e)
    }
}

async function loadTemplate (templatePath: string) : Promise<PizZip>{
    const content = fs.readFileSync(path.resolve(__dirname,templatePath),'binary');
    return new PizZip(content);
}


/**
 * 文件存在? true : false
 * @param filePath
 */
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await promises.access(filePath);
        return true;
    } catch (error) {
        return false;
    }
}

// export async function parseOldHtml(filePath: string): Promise<OldReportElement[]> {
//
// }
