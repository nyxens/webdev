for $x in doc("Books.xml")/library/book
where $x/year=2000
order by $x/title
return $x/title