# -*- coding: utf-8 -*-

"""
Copyright SeMi developers
@author: Giuseppe Futia <giuseppe.futia@gmail.com>
"""

from src.utils.util import read_json

class PrefixManager():
    """ Utility class to manage prefixes during the data generation

    Parameters
    ----------
    prefix_path : string
        Path of the prefix file (default = config/prefix.json)    
    """

    prefix_path='./config/prefix.json'
    PREFIX = read_json(prefix_path)
        
    @classmethod
    def get_prefix_string(cls):
        prefix_list = []
        prefix = ""
        for k,v in cls.PREFIX.items():  
            prefix_list.append('PREFIX {v}: <{k}>'.format(k=k, v=v))       
        return prefix.join([p + '\n' for p in prefix_list])
    
    @classmethod
    def from_prefix_to_uri(cls, str_with_prefix):
        for k, v in cls.PREFIX.items():
            if v + ':' in str_with_prefix: # Remember that there is ':' after the prefix
                return str_with_prefix.replace(v + ':', k)

    @classmethod
    def from_uri_to_prefix(cls, uri):
        for k, v in cls.PREFIX.items():
            if k in uri:
                return uri.replace(k, v + ':')

    






