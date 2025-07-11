const fileRepository = require('../repository/file-repository');
const fsPromise = require('fs/promises')
const fs = require('fs')
const path = require("path")
const crypto = require('crypto');
const { deleteFileError, fileErrorSave, maxFilesError } = require('../../../utils/messages');
const { isOpenFile } = require('../../../utils/function');
const sharp = require('sharp');
class FileService {

    async uploadFile(request) {
        try {
            const { file, location } = request.body;
            const result = await fileRepository.loadPath(location.value)
            if (!result.length) {
                throw new Error(fileErrorSave)
            }
            if (Array.isArray(file)) {
                if (file.length > 5) {
                    throw new Error(maxFilesError)
                }
            }

            const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
            const docExtensions = ['docx', 'doc', 'zip', 'rar', 'pdf', 'xls', 'xlsx', 'rtf', 'pptx'];
            const unsupportedExtensions = new Set();
            const allowedExtensions = [...imageExtensions, ...docExtensions];

            if (Array.isArray(file)) {
                for (const fileItem of file) {
                    const fileExtension = fileItem.filename.split('.').pop().toLowerCase();
                    if (!allowedExtensions.includes(fileExtension)) {
                        unsupportedExtensions.add(fileExtension);
                    }
                }
            } else {
                const fileExtension = file?.filename?.split('.')?.pop()?.toLowerCase();
                if (!allowedExtensions.includes(fileExtension)) {
                    unsupportedExtensions.add(fileExtension);
                }
            }

            if (unsupportedExtensions.size > 0) {
                throw new Error(`Завантаження файлів з розширеннями ${[...unsupportedExtensions].join(', ')} не підтримується`);
            }

            const directory = path.join(process.cwd(), "files", result[0].id);

            if (Array.isArray(file)) {
                const listFile = []
                for (const files of file) {
                    let finalExtension;
                    const fileExtension = files.filename.split('.').pop();
                    const fileName = crypto.randomUUID()
                    await fsPromise.mkdir(directory, { recursive: true })

                    if (imageExtensions.includes(fileExtension)) {
                        finalExtension = 'webp';
                        await sharp(await files.toBuffer())
                            .webp({ quality: 80 })
                            .toFile(path.join(directory, `${fileName}.${finalExtension}`));
                        listFile.push({
                            id: fileName,
                            server_name: path.join(result[0].id, `${fileName}.${finalExtension}`),
                            size: files.file?.bytesRead
                        })
                    } else {
                        finalExtension = fileExtension;
                        const writeStream = fs.createWriteStream(path.join(directory, `${fileName}.${finalExtension}`))
                        writeStream.write(await files.toBuffer())
                        writeStream.end()
                        listFile.push({
                            id: fileName,
                            orig_name: files.filename,
                            server_name: path.join(result[0].id, `${fileName}.${finalExtension}`),
                            to_list: true,
                            size: files.file?.bytesRead
                        })
                    }

                }
                return listFile
            }
            else {
                const listFile = []
                const fileExtension = file.filename.split('.').pop();
                const fileName = crypto.randomUUID()
                await fsPromise.mkdir(directory, { recursive: true });
                let finalExtension;
                if (imageExtensions.includes(fileExtension)) {
                    finalExtension = 'webp';
                    await sharp(await file.toBuffer())
                        .webp({ quality: 80 })
                        .toFile(path.join(directory, `${fileName}.${finalExtension}`));
                    listFile.push({
                        id: fileName,
                        server_name: path.join(result[0].id, `${fileName}.${finalExtension}`),
                        size: file.file?.bytesRead
                    })
                } else {
                    finalExtension = fileExtension;
                    const writeStream = fs.createWriteStream(path.join(directory, `${fileName}.${finalExtension}`))
                    writeStream.write(await file.toBuffer())
                    writeStream.end()
                    listFile.push({
                        id: fileName,
                        orig_name: file.filename,
                        server_name: path.join(result[0].id, `${fileName}.${finalExtension}`),
                        to_list: true,
                        size: file.file?.bytesRead
                    })
                }
                return listFile
            }

        } catch (error) {
            throw new Error(error.message)
        }
    }

    async deleteFile(request, reply) {
        const verifyLocation = await fileRepository.loadPath(request?.params?.location)
        if (!verifyLocation.length) {
            throw new Error(deleteFileError)
        }

        const isOk = await isOpenFile(path.join(process.cwd(), "files", `${request.params.location}`, `${request.params.id}`))
        if (!isOk) {
            return {
                "filepath": path.join(request.params.location, request.params.id),
                "op": "delete",
                "result": "success"
            }
        }
        await fsPromise.unlink(path.join(process.cwd(), "files", `${request.params.location}`, `${request.params.id}`))
        return {
            "filepath": path.join(request.params.location, request.params.id),
            "op": "delete",
            "result": "success"
        }
    }

}

module.exports = new FileService()