import {sequelize, User} from "../models/user";
import {Op, QueryTypes} from "sequelize";
import {UserData} from "../common/interfaces";
import * as console from "console";
import {decryptWithPrivateKey, encryptWithPublicKey} from "@/utils/rsa-utils";
import {UserAlreadyExistsException, UserNotFoundException, UserPasswordException} from "@/errors/users";


type LoginFailType = { code: 0, msg:string };
type LoginSuccessType = { code: 1; data: UserData };
type LoginType = LoginFailType | LoginSuccessType;
type UpdatePasswordType = {id:string,old_password:string,new_password:string};
type UpdateStatusType = {code:number,msg:string}

async function login(userdata: UserData): Promise<LoginType> {
        const user = await User.findOne({
            attributes:[
                'account',
                [sequelize.fn('BIN_TO_UUID',sequelize.col('id'),1),'id'],
                'password'
            ],
            where: {
                account: {
                    [Op.eq]: userdata.account,
                },
            },
        });

        if (user) {
            if (userdata.password === await decryptWithPrivateKey(user.get().password)) {
                return {
                    code: 1,
                    data: user.get() as UserData, // 确保返回的是UserData类型
                };
            } else {
                throw new UserPasswordException(user.get().account)
            }
        } else {
            throw new UserNotFoundException(userdata.account,'account')
        }
}





async function updatePassword(update_user_password_data: UpdatePasswordType): Promise<UpdateStatusType> {
        const user = await User.findOne({
            where: {
                id: {
                    [Op.eq]: update_user_password_data.id,
                },
            },
        });


        if (!user) {
            throw new UserNotFoundException( update_user_password_data.id,'id')
        }

        const decryptedPassword = await decryptWithPrivateKey(user.get().password);

        if (decryptedPassword !== update_user_password_data.old_password) {
            throw new UserPasswordException(update_user_password_data.id)
        }

        const encryptedNewPassword = await encryptWithPublicKey(update_user_password_data.new_password);

        const [affectedRows] = await User.update(
            { password: encryptedNewPassword },
            {
                where: {
                    id: {
                        [Op.eq]: user.get().id,
                    },
                },
            }
        );

        if (affectedRows === 1) {
            return {
                code: 1,
                msg: '',
            };
        } else {
            return {
                code: 0,
                msg: '更新数据异常！',
            };
        }
}

/**
 * return 账号存在 ? true : false
 * @param account
 */
async function findUserIsExistByAccount(account:string):Promise<boolean>{
    try {
        const user = await User.findOne({
            where: {
                account: {
                    [Op.eq]: account,
                },
            },
        });

        if (user === null) {
            // console.log('User not found');
            return false;
        }else{
            return true;
        }

    }catch (error){
        console.error(error);
        return false;
    }
}

// todo:try...catch
async function createUser(userdata: UserData): Promise<boolean> {
    try{
        const user: UserData = userdata;
        if (await findUserIsExistByAccount(user.account)){
            throw new UserAlreadyExistsException(userdata.account)
        }
        await User.create({
            // id:uuidv1(),
            account: user.account,
            password: await encryptWithPublicKey(user.password),
        });
        return true;

    }catch (error){
        console.error(error)
        return false
    }
}


async function findOneById(id: string) {
    try {
        const user = await User.findOne({
            attributes:[
              'account',
              [sequelize.fn('BIN_TO_UUID',sequelize.col('id'),1),'id']
            ],
            where: sequelize.literal('id = UUID_TO_BIN(:id,1)'),
            replacements: { id },
            limit: 1
        });

        if (user === null) {
            console.log('User not found');
            throw new UserNotFoundException(id, 'id');
        }

        return user;

    }catch (error){
        console.log(error)
    }
}







export {createUser, login, findOneById ,updatePassword };
