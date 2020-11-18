# -*- coding: utf-8 -*-

"""
Copyright SeMi developers
@author: Giuseppe Futia <giuseppe.futia@gmail.com>
"""

class TypedNode():
    """ Module for constructing a WeightedEdge
    
    Parameters
    ----------
    id : string
        Id of the node (e.g., Concept1)
    name : string
        Name of the destination node (e.g., Concept)
    n_type : string
        Type of node (default value = default)
    """

    def __init__(self, id, name, n_type='default'):
        self.id = id
        self.name = name
        self.n_type = n_type
    
    def __str__(self):
        return """Node Info:
        - Id: {i}
        - Name: {n}
        - Type: {t}""".format(i = self.id,
                                   n = self.name,
                                   t = self.n_type) 