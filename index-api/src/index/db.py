import shutil
from pathlib import Path

from fastapi.responses import FileResponse

ROOT_DIR_PATH = Path('data')
TRASH_DIR_PATH = Path('data/trash')

if not ROOT_DIR_PATH.exists():
    Path.mkdir(ROOT_DIR_PATH)

if not TRASH_DIR_PATH.exists():
    Path.mkdir(TRASH_DIR_PATH)


class MDFile:
    def __init__(self) -> None:
        self.id: str = ''
        self.path: str = ''
        self.is_dir: bool = False


class MarkdownDB:
    file_alias_voc: dict[str, str]

    def __init__(self):
        self.file_alias_voc = {}
        self.read_files_alias_to_voc(ROOT_DIR_PATH, self.file_alias_voc)

    def read_files_alias_to_voc(self, p: Path, voc: dict[str, str]):
        for child in p.iterdir():
            if child.name.startswith('.'):
                continue

            if child.is_dir():
                if child.name != 'assets':
                    self.read_files_alias_to_voc(child, voc)

            elif self.is_text_file_valid(child):
                file = p / child.stem
                alias = self.get_file_alias(child)
                if alias:
                    voc[file.relative_to(ROOT_DIR_PATH).as_posix()] = alias

    def get_files_tree(self):
        res = []
        return self.list_dir(ROOT_DIR_PATH, res)

    def list_dir(self, p: Path, res: list[MDFile]):
        for child in p.iterdir():
            if child.name.startswith('.'):
                continue

            if child.is_dir():
                if child.name == 'assets':
                    continue

                mdf = MDFile()
                mdf.id = child.name
                mdf.path = child.relative_to(ROOT_DIR_PATH).as_posix() + '/'
                mdf.is_dir = True
                res.append(mdf)
                self.list_dir(child, res)

            elif self.is_text_file_valid(child):
                mdf = MDFile()
                mdf.id = child.stem
                mdf.path = (p / mdf.id).relative_to(ROOT_DIR_PATH).as_posix()
                mdf.is_dir = False
                res.append(mdf)

        return res

    def is_text_file_valid(self, p: Path):
        return p.exists() and p.is_file() and not p.stem.startswith('.') and p.suffix == '.txt'

    def get_file_alias(self, p: Path) -> str:
        with p.open() as f:
            while True:
                row = f.readline()
                if row == '':
                    return ''
                elif row == '[ALIAS]\n':
                    return f.readline().strip()

    def mkdirs(self, path: str) -> list[MDFile]:
        res = []
        dir_names = path.split('/')
        if len(dir_names) > 0 and dir_names[0] == ROOT_DIR_PATH.as_posix():
            ind = 1
        else:
            ind = 0

        p = ROOT_DIR_PATH
        while ind < len(dir_names):
            n = dir_names[ind]
            if n == '' or n.endswith('.txt'):
                break

            p = p / n

            if not p.exists():
                print('Creating new dir:', p.as_posix())
                Path.mkdir(p)
                f = MDFile()
                f.id = n
                f.path = p.relative_to(ROOT_DIR_PATH).as_posix() + '/'
                f.is_dir = True
                res.append(f)
            ind += 1
        return res

    def read_file(self, src: str):
        p = ROOT_DIR_PATH / (src + '.txt')
        if p.exists():
            with p.open() as f:
                return {'is_dir': False, 'path': src, 'text': f.read()}

        raise FileNotFoundError

    def create_file(self, src: str, alias: str, text: str) -> list[MDFile]:
        if src == '' or src.find('//') != -1:
            raise InvalidPathOfFileError(path=src, details='Path is empty or has not allowed symbols.')

        # dir case
        if src.endswith('/'):
            p = ROOT_DIR_PATH / src
            if p.exists():
                raise FileAlreadyExistsError(src)

            return self.mkdirs(p.as_posix())

        # file case
        p = ROOT_DIR_PATH / (src + '.txt')
        if p.exists():
            raise FileAlreadyExistsError(src)

        new_files = self.mkdirs(p.as_posix())
        print('Creating new file:', src)
        mdf = MDFile()
        mdf.id = p.stem
        mdf.path = src
        mdf.is_dir = False
        new_files.append(mdf)

        f = p.open('wt')
        f.write(text)
        f.close()

        self.file_alias_voc[self.trim_suffix(p.relative_to(ROOT_DIR_PATH)).as_posix()] = alias
        return new_files

    def rewrite_file(self, src: str, alias: str, text: str) -> list[MDFile]:
        if src == '' or src.find('//') != -1:
            raise InvalidPathOfFileError(path=src, details='Path is empty or has not allowed symbols.')

        # dir case
        if src.endswith('/'):
            raise InvalidFileError(path=src, details='Directory can not be rewritten! Expected a file path without slash at the end.')

        # file case
        p = ROOT_DIR_PATH / (src + '.txt')
        if not p.exists():
            raise FileNotFoundError

        f = p.open('wt')
        f.write(text)
        f.close()

        self.file_alias_voc[self.trim_suffix(p.relative_to(ROOT_DIR_PATH)).as_posix()] = alias
        return []

    def trim_suffix(self, p: Path):
        return p.with_name(p.stem)

    def rename_file(self, from_src: str, to_src: str):
        if from_src == '' or from_src.find('//') != -1:
            raise InvalidPathOfFileError(path=from_src, details='Path is empty or has not allowed symbols.')

        if to_src == '' or to_src.find('//') != -1:
            raise InvalidPathOfFileError(path=to_src, details='Path is empty or has not allowed symbols.')

        if from_src.endswith('/') != to_src.endswith('/'):
            raise InvalidPathOfFileError(path=f'{from_src}->{to_src}', details='File can not be renamed to directory and vice versa.')

        if from_src.endswith('/'):
            fp = ROOT_DIR_PATH / from_src

            if not fp.exists():
                raise FileNotFoundError

            tp = ROOT_DIR_PATH / to_src
            if tp.exists():
                raise FileAlreadyExistsError(to_src)

            new_files = self.mkdirs(tp.as_posix())
            fp.rename(tp)
            return new_files
        else:
            fp = ROOT_DIR_PATH / (from_src + '.txt')
            if not fp.exists():
                raise FileNotFoundError

            tp = ROOT_DIR_PATH / (to_src + '.txt')
            if tp.exists():
                raise FileAlreadyExistsError(to_src)

            new_files = self.mkdirs(tp.as_posix())
            fp.rename(tp)
            return new_files

    def delete_file(self, src: str):
        if src == '' or src.find('//') != -1:
            raise InvalidPathOfFileError(path=src, details='Path is empty or has not allowed symbols.')

        if src.endswith('/'):
            p = ROOT_DIR_PATH / src
            print('Deleting file is dir:', p.as_posix())
            new_path = TRASH_DIR_PATH / src
            if not p.exists():
                print('Deleting dir path:', p.as_posix())
                raise FileNotFoundError

            new_path = TRASH_DIR_PATH / src

            if src.startswith(TRASH_DIR_PATH.name + '/'):
                print('Deleting dir from trash')
                shutil.rmtree(p.absolute().as_posix())
            elif new_path.exists():
                raise FileAlreadyExistsError(new_path.relative_to(ROOT_DIR_PATH).as_posix())
            elif new_path != p:
                new_files = self.mkdirs(new_path.as_posix())
                p.replace(new_path)
                print('Deleting file has been moved to:', new_path.as_posix())
                return new_files
        else:
            p = ROOT_DIR_PATH / (src + '.txt')
            if not p.exists():
                print('Deleting file path:', p.as_posix())
                raise FileNotFoundError

            print('Deleting file is not dir:', p.as_posix())
            new_path = TRASH_DIR_PATH / (src + '.txt')

            if src.startswith(TRASH_DIR_PATH.name + '/'):
                print('Deleting file from trash')
                p.unlink()
            elif new_path != p:
                new_files = self.mkdirs(new_path.as_posix())
                p.replace(new_path)

                f = MDFile()
                f.id = p.stem
                f.path = self.trim_suffix(new_path.relative_to(ROOT_DIR_PATH)).as_posix()
                f.is_dir = False
                new_files.append(f)

                print('Deleting file has been moved to:', new_path.as_posix())
                return new_files

        return []

    def get_asset(self, src: str):
        p = ROOT_DIR_PATH / src
        if not p.exists():
            raise FileNotFoundError

        return FileResponse(p.as_posix())

class ClientError(Exception):
    def __init__(self):
        super().__init__()

class FileAlreadyExistsError(ClientError):
    def __init__(self, path:str):
        super().__init__()
        self.path = path

    def __str__(self):
        return f'File "{self.path}" already exists!'


class InvalidPathOfFileError(ClientError):
    def __init__(self, path:str, details:str):
        super().__init__()
        self.path = path
        self.details = details

    def __str__(self):
        return f'Invalid path of file "{self.path}"! Details: {self.details}'


class InvalidFileError(ClientError):
    def __init__(self, path:str, details:str):
        super().__init__()
        self.path = path
        self.details = details

    def __str__(self):
        return f'Invalid file "{self.path}"! Details: {self.details}'
