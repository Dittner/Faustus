from fastapi import APIRouter
from fastapi.responses import FileResponse
import os

from src.index.schemas import TextFileSchema

ROOT_DIR = 'data'

router = APIRouter()


@router.get('/')
def index_root():
    return {"result": "index api is ready!"}


# ---------------
#     dir
# ---------------
def isValidTextFile(filePath):
    fileTitle, fileExtension = split(filePath, '.')
    return os.path.isfile(filePath) and not fileTitle.startswith('.') and fileExtension == 'txt'


def split(txt, rdelim):
    ind = txt.find(rdelim)
    if ind == -1:
        return (txt, '')
    return (txt[0:ind], txt[ind + 1:])


def mkdirs(path):
    dirNames = path.split('/')
    ind = 1 if len(dirNames) > 0 and dirNames[0] == ROOT_DIR else 0
    path = ROOT_DIR
    while ind < len(dirNames):
        n = dirNames[ind]
        path += '/' + n
        if n.endswith('.txt'): break
        if not os.path.isdir(path):
            print('Creating new dir:', path)
            os.mkdir(path)
        ind += 1
    pass


@router.get('/dir')
@router.get('/dir/{src:path}')
def list_dir(src: str = ''):
    if not os.path.isdir(ROOT_DIR):
        os.mkdir(ROOT_DIR)
        return 'Dir not found: ' + src, 404

    path = ROOT_DIR + '/' + src
    if not os.path.isdir(path):
        return 'Not a dir: ' + src, 404

    files = []
    names = os.listdir(path)

    print('API::list_dir, src:', src, 'names:', names)

    for name in names:
        if name.startswith('.') or name == 'info.txt': continue
        itemPath = path + '/' + name
        if os.path.isdir(itemPath):
            infoFilePath = path + '/' + name + '/info.txt'
            if isValidTextFile(infoFilePath):
                infoFile = open(infoFilePath, 'rt')
                info = infoFile.read()
                infoFile.close()
                files.append({'isDirectory': True, 'path': itemPath, 'text': info})
        elif isValidTextFile(itemPath):
            # fileTitle, fileExtension = split(name, '.')
            f = open(itemPath, 'rt')
            fileContent = f.read()
            f.close()
            files.append({'isDirectory': False, 'path': itemPath, 'text': fileContent})

    print('API::list_dir, files count:', len(files))
    return files



#---------------
#     file
#---------------

@router.get('/file/{src:path}')
def read_file(src):
    print('API::read_file, filePath:', src)
    path = ROOT_DIR + '/' + src

    if not os.path.isfile(path):
        return 'File not found: ' + src, 404

    file = open(path, 'rt')
    fileContent = file.read()
    file.close()
    return fileContent


@router.post('/file/{src:path}')
def write_file(tf:TextFileSchema, src):
    path = ROOT_DIR + '/' + src
    if not src.endswith('.txt'):
        print('Not a file:', path)
        return 'Not a file: ' + src, 400

    mkdirs(src)

    names = src.split('/')
    count = len(names)

    oldPath = ''
    newPath = ''

    if count > 1 and names[count-1] == 'info.txt':
        fileName = names[count-2]
        if fileName != tf.id:
            names[count-1] = ''
            oldPath = ROOT_DIR + '/' + '/'.join(names)
            names[count-2] = tf.id
            newPath = ROOT_DIR + '/' + '/'.join(names)
            print('New dir path:', newPath)
            if os.path.isdir(newPath):
                print('Dir already exists:', newPath)
                return 'Dir already exists: ' + newPath, 400
    elif count > 0:
        fileName, fileExtension = split(names[count-1], '.')
        if fileName != tf.id:
            names[count-1] = tf.id + '.txt'
            oldPath = path
            newPath = ROOT_DIR + '/' + '/'.join(names)
            print('New file path:', newPath)
            if os.path.isfile(newPath):
                print('File already exists:', newPath)
                return 'File already exists: ' + newPath, 400

    f = open(path, 'wt')
    f.write(tf.text)
    f.close()

    if len(oldPath) > 0 and len(newPath) > 0:
        print('Renaming from:', oldPath, ', to:', newPath)
        os.rename(oldPath, newPath)
    return 'ok', 200


@router.delete('/file/{src:path}')
def delete_file(src):
    path = ROOT_DIR + '/' + src
    print('Deleting file, path:', path)
    if not os.path.isfile(path) and not os.path.isdir(path):
        return 'File not found: ' + src, 404

    newPath = path.replace('/index/', '/bin/', 1)

    if newPath != path:
        mkdirs(newPath)
        os.replace(path, newPath)
        print('Deleting file has been moved to:', newPath)

    return 'ok', 200

#---------------
#     ASSETS
#---------------
@router.get('/asset/{src:path}')
def get_image(src):
    path = ROOT_DIR + '/' + src
    print('get_image::path:', path)
    if not os.path.isfile(path):
        return {'result': 'Asset not found, path: ' + src}

    return FileResponse(path)
