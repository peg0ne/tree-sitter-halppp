module.exports = grammar({
    name: "halppp",

    conflicts: ($) => [
            [$.subjective_expression, $.subjective_expression],
            [$.variable, $.variable],
            [$.adv_binary_expression, $.adv_binary_expression],
            [$.list_expression, $.list_expression],
            [$.variable, $.lambda_statement]
        ],


    rules: {
        program: ($) =>
            repeat(
                choice(
                    $.import_statement,
                    $.include_statement,
                    $.compiler_statement,
                    $.class_declaration,
                    $.enum_declaration,
                    $.glob_declaration,
                    $.method_definition,
                    $.comment
                )
            ),

        class_expr: $ => choice(
            prec.left(1,$.class_constructor),
            prec.left(2,$.class_property),
        ),

        _include: ($) => /[A-z_\.\"\/]+/,
        _get: ($) => /[A-z_\[\/]+/,
        compiler_statement: ($) =>
            seq("compiler", $.fatarrow, $.string, $.newline),
        include_statement: ($) =>
            seq(
                choice("inc", "use"),
                $.fatarrow,
                commaSep1($._include),
                $.newline
            ),
        import_statement: ($) =>
            seq("get", $.fatarrow, commaSep1($._get), $.newline),
        enum_declaration: ($) =>
            seq(
                "enum",
                $.identifier,
                $.newline,
                commaSep1($.identifier),
                ",",
                ";"
            ),
        glob_declaration: ($) =>
            seq(
                "glob",
                $.fatarrow,
                $.newline,
                repeat1(seq($.identifier, " ", $.expression_statement)),
                ";"
            ),
        class_declaration: ($) =>
            seq(
                choice("class", "struct"),
                choice($.identifier, $.templated),
                optional($.class_extends),
                $.newline,
                $.class_body
            ),
        class_extends: ($) => seq($.fatarrow, $.identifier),
        class_body: ($) =>
            seq(
                repeat1(
                    choice(
                        $.method_definition,
                        $.class_expr,
                        "pub",
                        "protected",
                        "private"
                    )
                ),
                ";"
            ),
        class_property: ($) =>
            seq(
                $.type_annotation,
                $.identifier,
                choice(
                    optional(seq("=", $.expression, $.newline)),
                    $.newline
                )
            ),
        class_constructor: ($) =>
            seq(
                $.type_annotation,
                optional($.parameter_list),
                $.fatarrow,
                choice($.method_with_return_type, $.method_without_return_type)
            ),
        method_definition: ($) =>
            seq(
                "fn",
                choice($.identifier, $.templated),
                optional($.parameter_list),
                $.fatarrow,
                choice($.method_with_return_type, $.method_without_return_type)
            ),
        method_without_return_type: ($) =>
            seq(choice($.do, seq($.newline, $.block))),
        method_with_return_type: ($) =>
            seq($.type_annotation, choice($.doremi, seq($.newline, $.block))),
        do: ($) => seq("do", $.expression_statement),
        doremi: ($) => seq("doremi", $.expression_statement),
        parameter_list: ($) => $.parameter_declaration_list,
        parameter_declaration_list: ($) => commaSep1($.parameter_declaration),
        parameter_declaration: ($) => seq($.type_annotation, $.identifier,
            optional(seq('=', $.literal))),
        block: ($) => seq(repeat($.statement), ";"),
        statement: ($) =>
            choice(
                prec.left(1,$.let_statement),
                prec.left(1,$.lambda_statement),
                prec.left(2,$.expression_statement),
                prec.left(2,$.if_statement),
                prec.left(2,$.while_statement),
                prec.left(2,$.for_statement),
                prec.left(2,$.foreach_statement),
                prec.left(2,$.select_statement),
                prec.left(2,$.switch_statement),
                prec.left(2,$.return_statement),
                prec.left(2,$.break_statement),
                prec.left(2,$.continue_statement),
                prec.left(2,$.create_statement),
                prec.left(2,$.create_simple_statement),
                prec.left(2,$.comment)
            ),
        statement_no_case: ($) =>
            choice(
                prec.left(2,$.expression_statement),
                prec.left(2,$.if_statement),
                prec.left(2,$.while_statement),
                prec.left(2,$.for_statement),
                prec.left(2,$.foreach_statement),
                prec.left(2,$.select_statement),
                prec.left(2,$.switch_statement),
                prec.left(2,$.comment)
            ),
        expression_statement: ($) => seq($.expression, $.newline),
        let_statement: ($) => prec.left(7,seq(
            "let", $.identifier, '=', $.expression, $.newline
        )),
        lambda_statement: ($) => seq(
            ">", $.identifier,
            commaSep($.identifier),
            "(",
            optional($.parameter_declaration),
            ")",
            $.block_or_do
        ),
        create_simple_statement: ($) => seq(
            $.type_annotation, $.identifier, $.newline
        ),
        create_statement: ($) => seq(
            $.type_annotation, $.identifier, "=", $.expression, $.newline
        ),
        if_statement: ($) =>
            seq(
                "if",
                choice(
                    prec.left(1,$.binary_expression),
                    prec.left(7,$.expression),
                ),
                choice($.general_do_statement, seq($.newline, $.block)),
                optional(
                    repeat(
                        seq(
                            "elif",
                            $.expression,
                            choice(
                                $.general_do_statement,
                                seq($.newline, $.block)
                            )
                        )
                    )
                ),
                optional(
                    seq(
                        "else",
                        choice($.general_do_statement, seq($.newline, $.block))
                    )
                )
            ),
        while_statement: ($) =>
            choice(
                seq("while", $.expression, $.block_or_do),
                seq("loop", $.newline, $.block_or_do)
            ),
        for_statement: ($) => seq("for", $.variable, "until", $.expression, $.block_or_do),
        foreach_statement: ($) => seq(
                "foreach",
                optional(seq($.variable, ",")),
                $.variable,
                "in",
                $.expression,
                $.block_or_do
            ),
        block_or_do: ($) =>
            choice(
                $.general_do_statement,
                $.block
            ),
        select_statement: ($) =>
            seq(
                "select",
                $.variable,
                "from",
                $.expression,
                choice($.general_do_statement, seq($.newline, $.block_or_do))
            ),
        switch_statement: ($) =>
            seq(
                "switch",
                $.expression_statement,
                repeat1($.case_statement),
                optional($.default_statement),
                ";"
            ),
        default_statement: ($) =>
            seq(
                "default",
                choice(
                    $.general_do_statement,
                    seq(
                        $.newline,
                        repeat($.statement),
                        $.break_statement
                    )
                )
            ),
        case_statement: ($) =>
            seq(
                "case",
                $.expression,
                choice(
                    $.general_do_statement,
                    seq(
                        $.newline,
                        repeat($.statement_no_case),
                        choice($.break_statement, $.return_statement)
                    ),
                    $.newline
                )
            ),
        general_do_statement: ($) =>
            seq(
                choice("do", "dobr", "dore", "doco", "doremi"),
                choice(
                    $.expression_statement,
                    $.return_statement,
                    $.continue_statement,
                    $.break_statement
                )
            ),
        return_statement: ($) =>
            seq("return", choice($.expression_statement, $.newline)),
        break_statement: ($) => seq("break", $.newline),
        continue_statement: ($) => seq("continue", $.newline),
        new_expression: ($) => prec.left(7, seq("new", $.expression)),
        delete_expression: ($) => prec.left(7, choice(
            seq("delete", "(", $.expression, ")"),
            seq("delete", $.expression),
            seq("delete", "(", $.identifier, ")"),
        )),
        expression: ($) =>
            choice(
                prec.left(6,$.adv_binary_expression),
                prec.left(1,$.new_expression),
                prec.left(1,$.delete_expression),
                prec.left(3,$.accessor_expression),
                prec.left(3,$.call_expression),
                prec.left(5,$.list_expression),
                prec.left(5,$.assignment_expression),
                prec.left(6,$.binary_expression),
                prec.left(7,$.subjective_expression),
                prec.left(7,$.bracketed_expression),
                prec.left(7,seq($.paren_expression, optional($.expression))),
                prec.left(7,$.cast_expression),
                prec.left(7,$.unary_expression),
                prec.left(7,$.constructor_expression),
                prec.left(7,$.member_expression),
                prec.left(7,$.this_expression),
                prec.left(7,$.super_expression),
                prec.left(8,$.variable),
                prec.left(8,$.literal),
                prec.left(9,seq("(",$.expression,")")),
            ),
        variable: ($) => seq(optional("&"), $.identifier, optional(choice($.argument_list ,$.list_accessor))),
        literal: ($) =>
            choice(
                $.number,
                $.format_string,
                $.raw_string,
                $.string,
                $.boolean,
                $.null,
                $.newline_char,
                $.char
            ),
        number: ($) => /\d+(\.\d+)?/,
        string: ($) => /\"[^\"]*\"/,
        raw_string: ($) => seq("R", $.string),
        format_string: ($) => seq("$", $.string),
        char: ($) => /\'[^\']*\'/,
        newline_char: ($) => /\'\n\'/,
        boolean: ($) => choice("true", "false"),
        null: ($) => choice("null", "NULL", "nullptr"),
        newline: ($) => "\n",

        assignment_expression: ($) =>
            prec.left(
                6,
                seq(
                    $.expression,
                    choice("=", "+=", "-=", "/=", "*="),
                    $.expression
                )
            ),

        subjective_expression: ($) =>
            prec.left(
                7,
                choice(
                    seq(
                        optional(choice("++", "--")),
                        $.expression,
                        choice("++", "--")
                    ),
                    seq(
                        choice("++", "--"),
                        $.expression,
                        optional(choice("++", "--"))
                    )
                )
            ),

        adv_binary_expression: ($) => seq(
            $.expression,
            choice(
                '=|=',
                '=&=',
                '=!=',
                '=>=',
                '=<=',
                '<<<',
                '>>>',
            ),
            $.expression,
            repeat1(seq(':', $.expression))
        ),

        binary_expression: ($) =>
            choice(
                prec.left(1, seq($.expression, "+", $.expression)),
                prec.left(1, seq($.expression, "-", $.expression)),
                prec.left(1, seq($.expression, "?", $.expression)),
                prec.left(1, seq($.expression, ":", $.expression)),
                prec.left(2, seq($.expression, "*", $.expression)),
                prec.left(2, seq($.expression, "/", $.expression)),
                prec.left(3, seq($.expression, "%", $.expression)),
                prec.left(3, seq($.expression, "==", $.expression)),
                prec.left(3, seq($.expression, "!=", $.expression)),
                prec.left(4, seq($.expression, ">", $.expression)),
                prec.left(4, seq($.expression, ">=", $.expression)),
                prec.left(4, seq($.expression, "< ", $.expression)),
                prec.left(4, seq($.expression, "<=", $.expression)),
                prec.left(5, seq($.expression, "&&", $.expression)),
                prec.left(6, seq($.expression, "||", $.expression)),
                prec.left(8, seq($.expression, "&", $.expression)),
            ),

        unary_expression: ($) =>
            choice(
                prec.left(7, seq("-", $.expression)),
                prec.left(7, seq("!", $.expression)),
                prec.left(7, seq("?", $.expression)),
                prec.left(7, seq(":", $.expression)),
            ),

        constructor_expression: ($) => seq($.templated, $.argument_list),

        call_expression: ($) =>
            prec.left(7, seq($.expression, $.argument_list)),

        list_expression: ($) => seq($.expression, $.list_accessor),

        member_expression: ($) =>
            prec.left(8, seq($.expression, choice(".", "->"), $.identifier)),

        accessor_expression: ($) =>
            prec.left(8, seq($.identifier, "::", $.identifier)),

        bracketed_expression: ($) => choice(
            seq('{','}'),
            seq("{", commaSep1($.expression), "}"
        )),
        paren_expression: ($) =>
            prec.left(6, seq("(", optional(choice($.expression, /[A-Za-z0-9_]+/)), ")")),
        cast_expression: ($) =>
            prec.left(7, seq("(", $.type_annotation, ")", $.expression)),
        this_expression: ($) => "this",

        super_expression: ($) => "super",

        argument_list: ($) =>
            prec.left(8, seq("(", optional(commaSep1($.expression)), ")")),

        list_accessor: ($) =>
            prec.left(7, seq("[", choice($.expression, $.literal), "]")),
        fatarrow: ($) => prec.left(-10, "=>"),
        identifier: ($) => /[A-Za-z_]+/,
        templated: ($) =>
            prec.left(
                4,
                seq(
                    $.identifier,
                    "<",
                    commaSep1($.type_annotation),
                    ">",
                    repeat(/\*/)
                )
            ),

        type_annotation: ($) =>
            prec(
                5,
                choice(
                    $.templated,
                    seq($.identifier, repeat(/\*/)),
                    $.identifier
                )
            ),

        comment: ($) =>
            token(
                prec(
                    -1,
                    choice(
                        seq("//", /.*/),
                        seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
                    )
                )
            ),
    },
});

function commaSep(rule) {
    return seq(optional(rule), repeat(seq(",", rule)));
}

function commaSep1(rule) {
    return seq(rule, repeat(seq(",", rule)));
}