# VisualStudioKeyConverter
Converts XML exports of myvisualstudio.com to a simplified .txt file

## How to use

Install the dependencies with `npm install`.

In order to start the conversion you can invoke the following command:
```bash
node index.js -i <inputfile> -e <output.txt>
```

**Arguments:**
```
-input denotes the input filename, the file needs to be placed in the same directory.
-export denotes the filename of the completed export. The resulting file will be exported to the root directory.
-i shorthand syntax for -input
-e shorthand syntax for -export
```
