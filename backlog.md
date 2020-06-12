### Make sure this script is in Formidable to parse multiple checkbox value

Overwrite the line that says `fields[name] = value;` in `lib/incoming_form.js` around lines `85`-`87`

This is the github push request:
[Array parameters support #380](https://github.com/felixge/node-formidable/pull/380/files)

    if (name.slice(-2) === '[]') {
      var realName = name.slice(0, name.length - 2);
      if (realName in fields) {
        if (!Array.isArray(fields[realName])) {
          fields[realName] = [fields[realName]];
        }
      } else {
        fields[realName] = [];
      }
      fields[realName].push(value);
    } else {
      fields[name] = value;
    }

### repeater.js

Had to add the ability for it to duplicate textarea fields. Was a simple update.

On `Line 13` change:

  var input = item.find('input,select');

to

  var input = item.find('input,select,textarea');