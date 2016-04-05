# nestly
This is a Node module and command line tool for creating structured data from tabular input using a declarative "meta-structure" in JSON or YAML, which looks something like this:

```yaml
values:
  '{x}':
    '{y}': '{z}'
```

In a meta-structure, any object key with `{` and `}` markers becomes a nesting point for your data. Everything else (such as the top-level `values` key) is preserved as-is. In the case above, the tabular input would be assumed to have columns named `x`, `y`, and `z`. The other implicit assumption is that there is _only one unique value_ of `z` for each permutation of `x` and `y`. So, if you had some CSV data like this:

```
x,y,z
a,a,2
a,b,3
b,a,1
b,b,5
```

Then nestly would combine the above meta-structure and data to create the following output in YAML:

```yaml
values:
  'a':
    'a': '2'
    'b': '3'
  'b':
    'a': '1'
    'b': '5'
```

## Command line interface
The `nestly` command line tool works like this:

```
nestly [--config file | filename] data-filename [-o | output-filename]

Options:
  --cf          The format of the config file: "json" or "yaml"
                                                       [default: "json"]
  --if          The format of the input data: "csv", "tsv", "json", or
                "yaml"
  --of          The format of the output data: "json" or "yaml"
                                                       [default: "json"]
  -c, --config  The path to your nesting configuration file
  -i, --in      The path of your input data file
  -o, --out     The name of the ouput file
  -h, --help    Show this help screen
```

The `config` should be a JSON or YAML file that encodes the "meta-structure" described above. If you don't provide the `--if` (input format) and `--of` (output format) options, then the formats are inferred from the filenames. (You should provide the format options if you're piping to or from stdio.) The above output would be generated with:

```sh
nestly --config structure.yml xyz.csv -o nested.yml
```

## What problem does this solve?
I made it to ease the incorporation of data into [Jekyll] projects, where tabular formats can be tricky to work with. For instance, let's say you have some data in a spreadsheet like this:

City | Year | Population
:--- | :--- | ---:
San Diego | 2010 | 1,306,000
San Diego | 2011 | 1,320,000
San Diego | 2012 | 1,337,000
San Diego | 2013 | 1,356,000
San Francisco | 2013 | 837,442
San Francisco | 2012 | 827,420
San Francisco | 2011 | 815,06
San Francisco | 2010 | 805,704
San Jose | 2013 | 998,537
San Jose | 2012 | 982,579
San Jose | 2011 | 970,011
San Jose | 2010 | 955,264

If I wanted to generate a Jekyll page with a section per city, I would need to create a separate list of the city names like this, using the [`where` template filter](https://github.com/jekyll/jekyll/blob/b06af5a44f47ec6cf5f203e8eb318868eac0ae86/lib/jekyll/filters.rb#L215-L226):

```html
---
cities:
- San Diego
- San Francisco
- San Jose
---
{% for city in page.cities %}
<section id="{{ city | slugify }">
  <h1>{{ city }} Population</h1>
  <ul>
    {% for row in site.data.cities | where: 'City', city %}
    <li>{{ row.Population }} in {{ row.Year }}</li>
    {% endfor %}
  </ul>
</section>
{% endfor %}
```

But if we generated some strucrured data with:

```yaml
'{City}':
  population:
    '{Year}': '{Population}'
```

Then our template could be simplified to:

```html
{% for city in site.data.cities %}
<section id="{{ city | slugify }}">
  <h1>{{ city }} Population</h1>
  <ul>
  {% for year in city.population %}
    <li>{{ year[1] }} in {{ year[0] }}</li>
  {% endfor %}
  </ul>
</section>
{% endfor %}
```

[Jekyll]: https://jekyllrb.com/
