from os import listdir
from os.path import isfile, join


class ModelDictionary(object):

    # Initialize with the name of the parser and the folder that include data
    def __init__(self, parser, path):
        self.parser = parser
        self.path = path

    def file_path_for_dict(self):
        if self.parser == 'RODI':
            return self._file_path_for_rodi_dict()
        elif self.parser == 'PC':
            return self._file_path_for_pc_dict()

    def _file_path_for_rodi_dict(self):
        # Return the correct path of plausible_final.ttl
        return self.path

    def _file_path_for_pc_dict(self):
        self.path = '../../data/training/pc/complete.ttl'
        return self.path
