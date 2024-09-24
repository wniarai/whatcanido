export interface UserData {
    id: string;
    account: string;
    password: string;
}

export interface FileData {
    id: string;
    filename: string;
    path: string;
    user_id: string;
    created_at: Date;
    file_type: 'html' | 'docx';
    is_deleted: boolean;
    db_type: 'g100' | 'e100' | 'pg' | 'og' | 'panwei'
}