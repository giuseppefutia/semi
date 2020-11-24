# -*- coding: utf-8 -*-

"""
Copyright SeMi developers
@author: Giuseppe Futia <giuseppe.futia@gmail.com>
"""

import unittest
from src.utils.prefix import PrefixManager

class PrefixManagerTester(unittest.TestCase):

    def setUp(self):
        self.p = PrefixManager
    
    def test_prefix_string(self):
        prefix_string = self.p.get_prefix_string()
        assert 'PREFIX schema: <http://schema.org/>' in prefix_string
        assert self.p.from_uri_to_prefix('http://schema.org/') == 'schema:'
        assert self.p.from_prefix_to_uri('schema:') == 'http://schema.org/'
        assert self.p.from_prefix_to_uri('id:example') == 'http://collection.britishmuseum.org/id/example'
        assert self.p.from_uri_to_prefix('http://collection.britishmuseum.org/id/example') == 'id:example'

    def tearDown(self):
        pass

if __name__ == '__main__':
    unittest.main()

