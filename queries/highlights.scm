; highlights.scm

[
    "fn"
    "class"
    "struct"
    "enum"
    "glob"
] @function
[
    "return"
    "select"
    "get"
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
] @keyword
[
    ";"
    "=>"
] @constant
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