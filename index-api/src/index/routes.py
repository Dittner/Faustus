from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse

from src.index.schemas import TextFileSchema

ROOT_DIR_PATH = Path('data')
TRASH_DIR_PATH = Path('data/trash')

if not ROOT_DIR_PATH.exists():
    Path.mkdir(ROOT_DIR_PATH)

if not TRASH_DIR_PATH.exists():
    Path.mkdir(TRASH_DIR_PATH)

router = APIRouter()


@router.get('/')
def index_root():
    return {'result': 'index api is ready!'}


# ---------------
#     dir
# ---------------
def is_valid_text_file(p: Path):
    return p.exists() and p.is_file() and not p.stem.startswith('.') and p.suffix == '.txt'


def mkdirs(path: str):
    dir_names = path.split('/')
    ind = 1 if len(dir_names) > 0 and dir_names[0] == ROOT_DIR_PATH.as_posix() else 0
    p = ROOT_DIR_PATH
    while ind < len(dir_names):
        n = dir_names[ind]
        p = p / n
        if n.endswith('.txt'):
            break

        if not p.exists():
            print('Creating new dir:', path)
            Path.mkdir(p)
        ind += 1


@router.get('/dir')
@router.get('/dir/{src:path}')
def list_dir(src: str = ''):
    p = ROOT_DIR_PATH / src
    if not p.is_dir():
        return 'Not a dir: ' + src, 404

    files = []

    # print('API::list_dir, src:', p.as_posix(), ', children:', list(p.iterdir()))

    for child in p.iterdir():
        if child.name.startswith('.') or child.name == 'info.txt':
            continue

        if child.is_dir():
            info_file_path: Path = child / 'info.txt'
            if is_valid_text_file(info_file_path):
                info_file = info_file_path.open('rt')
                info = info_file.read()
                info_file.close()
                files.append({'isDirectory': True, 'path': child.as_posix(), 'text': info})
        elif is_valid_text_file(child):
            f = child.open('rt')
            file_content = f.read()
            f.close()
            files.append({'isDirectory': False, 'path': child.as_posix(), 'text': file_content})

    print('API::list_dir, files count:', len(files))
    return files


# ---------------
#     file
# ---------------


@router.get('/file/{src:path}')
def read_file(src: str):
    print('API::read_file, filePath:', src)
    p = ROOT_DIR_PATH / src

    if not p.exists():
        return 'File not found: ' + src, 404

    file = p.open('rt')
    file_content = file.read()
    file.close()
    return file_content


@router.post('/file/{src:path}')
def write_file(tf: TextFileSchema, src: str):
    p = ROOT_DIR_PATH / src
    if p.suffix != '.txt':
        print('Not a file:', p.as_posix())
        return 'Not a file: ' + src, 400

    mkdirs(src)

    names = src.split('/')
    count = len(names)

    old_path = ROOT_DIR_PATH / src
    new_path = ROOT_DIR_PATH / src

    # directory case
    if p.name == 'info.txt':
        dir_name = names[count - 2]
        if dir_name != tf.id:
            names[count - 1] = ''
            names[count - 2] = tf.id
            new_path = ROOT_DIR_PATH / '/'.join(names)
            print('New dir path:', new_path)
            if Path.is_dir(Path(new_path)):
                print('Dir already exists:', new_path)
                return 'Dir already exists: ' + new_path, 400
    # file case
    elif count > 0:
        file_name = p.stem
        if file_name != tf.id:
            names[count - 1] = tf.id + '.txt'
            new_path = ROOT_DIR_PATH / '/'.join(names)
            print('New file path:', new_path)
            if new_path.exists():
                print('File already exists:', new_path)
                return 'File already exists: ' + new_path, 400

    f = p.open('wt')
    f.write(tf.text)
    f.close()

    if new_path != old_path:
        print('Renaming from:', old_path.as_posix(), 'to:', new_path.as_posix())
        old_path.rename(new_path)

    return 'ok', 200


@router.delete('/file/{src:path}')
def delete_file(src: str):
    p = ROOT_DIR_PATH / src
    print('Deleting file, path:', p.as_posix())
    if not p.exists():
        return 'File not found: ' + src, 404

    new_path = Path('trash/' + p.name)

    if new_path != p:
        p.replace(new_path)
        print('Deleting file has been moved to:', new_path.as_posix())

    return 'ok', 200


# ---------------
#     ASSETS
# ---------------
@router.get('/asset/{src:path}')
def get_image(src: str):
    p = ROOT_DIR_PATH / src
    print('get_image::path:', p.as_posix())
    if not p.exists():
        return {'result': 'Asset not found, path: ' + src}

    return FileResponse(p.as_posix())
