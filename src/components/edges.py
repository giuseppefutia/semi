# -*- coding: utf-8 -*-

"""
Copyright SeMi developers
@author: Giuseppe Futia <giuseppe.futia@gmail.com>
"""

class WeightedEdge():
    """ Module for constructing a WeightedEdge
    
    Parameters
    ----------
    src : string
        Id of the source node
    dst : string
        Id of the destination node
    prop : string
        Name of the property
    weight : float
        Weight of the edge
    e_type : string
        Type of edge (default value = default)
    
    Arguments
    ---------
    id : string
        Id of the edge (src***name***dst) 
    src : string
        Id of the source node
    dst : string
        Id of the destination node
    prop : string
        Name of the property
    weight: float
        Weight of the edge
    e_type : string
        Type of edge (default value = default)
    """

    def __init__(self, src, dst, prop, weight, e_type='default'):
        self.id = src + '***' + prop + '***' + dst
        self.src = src
        self.dst = dst
        self.prop = prop
        self.weight = weight
        self.e_type = e_type

    def __str__(self):
        return """Edge info:
        - Edge id: {i}
        - Source node id: {s}
        - Destination node id: {d}
        - Property name: {p}
        - Weight: {w}
        - Edge type: {e}""".format(i = self.id,
                                   s = self.src,
                                   d = self.dst,
                                   p = self.prop,
                                   w = self.weight,
                                   e = self.e_type) 