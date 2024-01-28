; highlights.scm

[
    "fn"
    "class"
    "struct"
    "enum"
    "glob"
    "delete"
    "raw"
] @function
[
    "return"
    "new"
    "select"
    "match"
    "get"
    "compiler"
    "let"
    "inc"
    "use"
    "for"
    "foreach"
    "if"
    "elif"
    "else"
    "loop"
    "while"
    "switch"
] @keyword
[
    "from"
    "in"
    "until"
    "case"
    "default"
    "do"
    "dore"
    "dobr"
    "doco"
    "doremi"
    "break"
    "continue"
] @function.builtin
(comment) @comment
(number) @number
[
    (boolean)
    (null)
    (char)
    (newline_char)
    
] @constant.builtin
[
    (format_string)
    (raw_string)
] @string.special
(string) @string
(identifier) @variable
(type_annotation) @type.builtin
[
    "*"
    ","
    "("
    ")"
    ">"
    "<"
    "["
    "{"
    "}"
    "?"
    "+"
    "++"
    "-"
    "--"
    "/"
    "!"
    "=="
    ":"
    "&"
    "<"
    "<<<"
    ">>>"
    "=|="
    "=&="
    "="
    "<="
    ">="
    "=!="
    "||"
    "!="
] @operator
[
    ";"
    "=>"
    "->"
    "."
    "*"
] @constant
(ERROR) @constant
