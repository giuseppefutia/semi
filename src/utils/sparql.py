# -*- coding: utf-8 -*-

"""
Copyright SeMi developers
@author: Giuseppe Futia <giuseppe.futia@gmail.com>
"""

from src.utils.prefix import PrefixManager

def closures_query(st_class, ont_class='rdfs:Class', domain_prop='rdfs:domain', range_prop='rdfs:range'):
    """ Compose a query to retrive the closure classes.
    The closures are all the classes of the ontology
    that are connected to a specific semantic type class.

    Parameters
    ----------
    st_class : string
        Class of the semantic type
    ont_class : string
        String representing a class in the ontology (default='rdfs:Class')
    domain_prop: string
        String representing the domain property in the ontology (default='rdfs:domain')
    range_prop: string
        String representing the range property in the ontology (default='rdfs:range')
    
    Returns
    -------
    query : string
        Text of the query to get the closures
    """
    query = """
        {p}

        SELECT DISTINCT ?closures ?property WHERE {{
            {{
                ?property {d} {s} .
                ?property {r} ?closures .
                ?closures a {o} .
                ?property a owl:ObjectProperty .
            }}
            UNION {{
                ?property {d} ?closures .
                ?property {r} {s} .
                ?closures a {o} .
                ?property a owl:ObjectProperty .
            }}
        }}
    """.format(p=PrefixManager.get_prefix_string(),
               s=st_class,
               o=ont_class,
               d=domain_prop,
               r=range_prop)

    return query

def related_classes_query(st_class, ont_class='rdfs:Class', subclass_prop='rdfs:subClassOf'):
    """ Compose the query to retrieve subclasses and superclasses related to semantic type class.

    Parameters
    ----------
    st_class : string
        Class of the semantic type
    ont_class : string
        String representing a class in the ontology (default='rdfs:Class')
    subclass_prop: string
        String representing the subclass property in the ontology (default='rdfs:subClassOf')

    Returns
    -------
    query : string
        Text of the query to get the related classes

    """
    query = """
        {p}

        SELECT DISTINCT ?classes WHERE {{
            {{
                {s} {sp} ?classes .
                {s} a {o} .
                ?classes a {o} .
            }}
            UNION {{
                ?classes {sp} {s} .
                {s} a {o} .
                ?classes a {o} .
            }}
        }}
    """.format(p=PrefixManager.get_prefix_string(),
               s=st_class,
               o=ont_class,
               sp=subclass_prop)
    
    return query

def property_query(h_class, t_class, ont_class='rdfs:Class', domain_prop='rdfs:domain', range_prop='rdfs:range'):
    """ Compose the query to retrieve the properties between 2 classes.

    Parameters
    ----------
    h_class : string
        Head class
    t_class : string
        Tail class
    ont_class : string
        String representing a class in the ontology (default='rdfs:Class')
    domain_prop : string
        String representing the domain property in the ontology (default='rdfs:domain')
    range_prop : string
        String representing the range property in the ontology (default='rdfs:range')

    Returns
    -------
    query : string
        Text of the query to get the properties between two classes

    """
    query = """
        {p}

        SELECT ?properties WHERE {{
            {h} a {o} .
            {t} a {o} .
            ?properties a owl:ObjectProperty .
            ?properties {d} {h} .
            ?properties {r} {t} .
        }}
    """.format(p=PrefixManager.get_prefix_string(),
               h=h_class,
               t=t_class,
               o=ont_class,
               d=domain_prop,
               r=range_prop)
    
    return query

def all_classes_query(ont_class='rdfs:Class'):
    """ Compose the query to retrieve all the ontology classes.

    Parameters
    ----------
    ont_class : string
        String representing a class in the ontology (default='rdfs:Class')

    Returns
    -------
    query : string
        Text of the query to get all the ontology classes
    """
    query = """
        {p}

        SELECT ?classes WHERE {{
            ?classes a {o} .
        }}
    """.format(p=PrefixManager.get_prefix_string(),
               o=ont_class)
    
    return query

def check_subclassof_property_query(h_class, t_class, prop='rdfs:subClassOf'):
    """ Compose the query to verify is a rdfs:subClassOf exists between two classes.

    Parameters
    ----------
    h_class : string
        Head class
    t_class : string
        Tail class
    prop : string
        String representing the subclasss property in the ontology (default='rdfs:subClassOf')
    """
    query = """
        {p}

        ASK {{
            {h} {sp} {t} .
        }}
    """.format(p=PrefixManager.get_prefix_string(),
               h=h_class,
               sp=prop,
               t=t_class)
    
    return query


