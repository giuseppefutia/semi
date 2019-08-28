# JARQL invocation for high quality KG built using cmt ontology
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/cmt/Paper.json data/training/rodi/cmt/Paper.query > data/training/rodi/cmt/Paper.ttl
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/cmt/Person.json data/training/rodi/cmt/Person.query > data/training/rodi/cmt/Person.ttl
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/cmt/co-writePaper.json data/training/rodi/cmt/co-writePaper.query > data/training/rodi/cmt/co-writePaper.ttl
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/cmt/hasConferenceMember.json data/training/rodi/cmt/hasConferenceMember.query > data/training/rodi/cmt/hasConferenceMember.ttl
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/cmt/hasProgramCommitteeMember.json data/training/rodi/cmt/hasProgramCommitteeMember.query > data/training/rodi/cmt/hasProgramCommitteeMember.ttl

echo Remove the cmt/final.ttl file if exist
rm data/training/rodi/cmt/final.ttl
cat data/training/rodi/cmt/*.ttl > data/training/rodi/cmt/final.ttl
echo New cmt/final.ttl file created

# JARQL invocation for high quality KG built using conference ontology
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/conference/Abstract.json data/training/rodi/conference/Abstract.query > data/training/rodi/conference/Abstract.ttl
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/conference/Conference_contribution.json data/training/rodi/conference/Conference_contribution.query > data/training/rodi/conference/Conference_contribution.ttl
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/conference/Paper.json data/training/rodi/conference/Paper.query > data/training/rodi/conference/Paper.ttl
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/conference/Review.json data/training/rodi/conference/Review.query > data/training/rodi/conference/Review.ttl
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/conference/committee_person.json data/training/rodi/conference/committee_person.query > data/training/rodi/conference/committee_person.ttl
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/conference/contributes.json data/training/rodi/conference/contributes.query > data/training/rodi/conference/contributes.ttl

echo Remove the conference/final.ttl file if exist
rm data/training/rodi/conference/final.ttl
cat data/training/rodi/conference/*.ttl > data/training/rodi/conference/final.ttl
echo New conference/final.ttl file created

# JARQL invocation for high quality KG built using sigkdd ontology
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/sigkdd/Committee.json data/training/rodi/sigkdd/Committee.query > data/training/rodi/sigkdd/Committee.ttl
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/sigkdd/Review.json data/training/rodi/sigkdd/Review.query > data/training/rodi/sigkdd/Review.ttl
java -jar jarql-1.0.1-SNAPSHOT.jar data/training/rodi/sigkdd/submit.json data/training/rodi/sigkdd/submit.query > data/training/rodi/sigkdd/submit.ttl

echo Remove the sigkdd/final.ttl file if exist
rm data/training/rodi/sigkdd/final.ttl
cat data/training/rodi/sigkdd/*.ttl > data/training/rodi/sigkdd/final.ttl
echo New sigkdd/final.ttl file created
