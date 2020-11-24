# -*- coding: utf-8 -*-

"""
Copyright SeMi developers
@author: Giuseppe Futia <giuseppe.futia@gmail.com>
"""

import json
from pathlib import Path
from collections import OrderedDict

def read_json(fname):
    """Read JSON files in a standard way
    """
    fname = Path(fname)
    with fname.open('rt') as f:
        return json.load(f, object_hook=OrderedDict)

def write_json(content, fname):
    """Write JSON files in a standard way
    """
    fname = Path(fname)
    with fname.open('wt') as f:
        json.dump(content, f, indent=4, sort_keys=False)

def print_all(components):
    """Get a list of components (nodes or edges) and print their features
    """
    for c in components:
        print(c)