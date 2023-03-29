module.exports = grammar({
    name: "halppp",
    
    conflicts: $ => [
        [$.class_constructor, $.type_annotation],
        [$.expression, $.list_accessor],
        [$.let_statement, $.expression],
        [$.assignment_expression, $.subjective_expression],
        [$.call_expression, $.subjective_expression],
        [$.list_expression, $.subjective_expression],
        [$.subjective_expression, $.subjective_expression],
        [$.new_expression, $.assignment_expression],
        [$.new_expression, $.subjective_expression],
        [$.new_expression, $.call_expression],
        [$.new_expression, $.list_expression],
        [$.type_annotation, $.variable],
        [$.assignment_expression, $.cast_expression],
        [$.subjective_expression, $.cast_expression],
        [$.call_expression, $.cast_expression],
        [$.list_expression, $.cast_expression],
        [$.new_expression, $.inline_ifelse_expression],
        [$.subjective_expression, $.inline_ifelse_expression],
        [$.cast_expression, $.inline_ifelse_expression],
        [$.assignment_expression, $.inline_ifelse_expression],
        [$.inline_ifelse_expression, $.inline_ifelse_expression],
        [$.call_expression, $.inline_ifelse_expression],
        [$.list_expression, $.inline_ifelse_expression],
    ],

    rules: {
        program: $ => repeat(
            choice(
                $.import_statement,
                $.include_statement,
                $.compiler_statement,
                $.class_declaration,
                $.enum_declaration,
                $.glob_declaration,
                $.method_definition,
                $.comment,
            )),
        
        _include: $ => /[A-z_\.\"\/]+/,
        _get: $ => /[A-z_\[\/]+/,
        compiler_statement: $ => seq(
            'compiler',
            '=>',
            $.string,
            '\n'
        ),
        include_statement: $ => seq(
            choice('inc', 'use'),
            '=>',
            commaSep1($._include),
            '\n'
        ),
        import_statement: $ => seq(
            'get',
            '=>',
            commaSep1($._get),
            '\n'
        ),
        enum_declaration: $ => seq(
            'enum',
            $.identifier,
            '\n',
            commaSep1($.identifier),
            ',',
            ';'
        ),
        glob_declaration: $ => seq(
            'glob',
            '=>',
            '\n',
            repeat1(seq(
                    $.identifier,
                    ' ',
                    $.expression_statement
                )
            ),
            ';'
        ),
        class_declaration: $ => seq(
            choice('class', 'struct'),
            $.identifier,
            optional($.class_extends),
            '\n',
            $.class_body
        ),
        class_extends: $ => seq(
            '=>',
            $.identifier
        ),
        class_body: $ => seq(
            repeat(choice(
                $.method_definition,
                $.class_constructor,
                $.class_property,
                'pub',
                'protected',
                'private'
            )),
            ';'
        ),
        class_property: $ => seq(
            $.type_annotation,
            $.identifier,
            optional(seq('=', $.expression)),
            '\n'
        ),
        class_constructor: $ => seq(
            choice($.identifier, $.templated),
            optional($.parameter_list),
            '=>',
            choice(
                $.method_with_return_type,
                $.method_without_return_type,
            )
        ),
        method_definition: $ => seq(
            'fn',
            choice($.identifier, $.templated),
            optional($.parameter_list),
            '=>',
            choice(
                $.method_with_return_type,
                $.method_without_return_type,
            )
        ),
        method_without_return_type: $ => seq(
            choice(
                $.do,
                seq('\n', $.block)
            )
        ),
        method_with_return_type: $ => seq(
            $.type_annotation,
            choice(
                $.doremi,
                seq('\n', $.block)
            )
        ),
        do: $ => seq(
            'do',
            $.expression_statement
        ),
        doremi: $ => seq(
            'doremi',
            $.expression_statement
        ),
        parameter_list: $ => $.parameter_declaration_list,
        parameter_declaration_list: $ => commaSep1($.parameter_declaration),
        parameter_declaration: $ => seq(
            $.type_annotation,
            $.identifier
        ),
        block: $ => seq(
            repeat($.statement),
            ';'
        ),
        statement: $ => choice(
            $.expression_statement,
            $.if_statement,
            $.while_statement,
            $.for_statement,
            $.select_statement,
            $.switch_statement,
            $.return_statement,
            $.break_statement,
            $.continue_statement,
            $.let_statement,
            $.comment,
        ),
        expression_statement: $ => seq(
            $.expression,
            '\n'
        ),
        let_statement: $ => seq(
            'let',
            $.assignment_expression
        ),
        if_statement: $ => seq(
            'if', $.expression,
            choice(
                $.general_do_statement,
                seq('\n', $.block)
            ),
            optional(repeat(
                seq(
                    'elif',
                    $.expression,
                    choice(
                        $.general_do_statement,
                        seq('\n', $.block)
                    ),
                )
            )),
            optional(seq('else', 
                choice(
                    $.general_do_statement,
                    seq('\n', $.block)
                ),
            ))
        ),
        while_statement: $ => choice(
            seq('while',$.expression,$.block),
            seq('loop','\n',$.block)
        ),
        for_statement: $ => choice(
            seq('for',$.variable,'until',$.expression,$.block),
            seq('foreach',optional(seq($.variable,',')),$.variable,'in',$.expression,$.block),
        ),
        select_statement: $ => seq(
            'select',
            $.variable,
            'from',
            $.expression,
            choice(
                $.general_do_statement,
                seq('\n', $.block)
            )
        ),
        switch_statement: $ => seq(
            'switch',
            $.expression_statement,
            repeat1($.case_statement),
            optional($.default_statement),
            ';'
        ),
        default_statement: $ => seq(
            'default',
            choice(
                $.general_do_statement,
                seq('\n', repeat($.expression_statement), $.break_statement)
            )
        ),
        case_statement: $ => seq(
            'case',
            $.expression,
            choice(
                $.general_do_statement,
                seq('\n', repeat($.expression_statement), $.break_statement),
                '\n'
            )
        ),
        general_do_statement: $ => seq(
            choice(
                'do', 'dobr',
                'dore', 'doco',
                'doremi'
            ),
            choice(
                $.expression_statement,
                $.return_statement,
                $.continue_statement,
                $.break_statement,
            )
        ),
        return_statement: $ => seq(
            'return',
            choice(
                $.expression_statement,
                '\n'
            )
        ),
        break_statement: $ => seq('break','\n'),
        continue_statement: $ => seq('continue','\n'),
        new_expression: $ => seq('new', $.expression),
        expression: $ => choice(
            $.variable,
            $.literal,
            $.new_expression,
            $.accessor_expression,
            $.list_expression,
            $.assignment_expression,
            $.binary_expression,
            $.subjective_expression,
            $.bracketed_expression,
            $.cast_expression,
            $.inline_ifelse_expression,
            $.unary_expression,
            $.constructor_expression,
            $.call_expression,
            $.member_expression,
            $.this_expression,
            $.super_expression
        ),
        variable: $ => seq(optional('&'),$.identifier),
        literal: $ => choice($.number, $.format_string, $.string, $.boolean, $.null, $.char),
        number: $ => /\d+(\.\d+)?/,
        string: $ => /\"[^\"]*\"/,
        format_string: $ => /\$\"[^\"]*\"/,
        char: $ => /\'[^\']*\'/,
        boolean: $ => choice('true', 'false'),
        null: $ => choice('null','NULL','nullptr'),
        
        assignment_expression: $ => prec.right(seq(
            $.expression,
            choice('=', '+=', '-=', '/=', '*='),
            $.expression
        )),

        subjective_expression: $ => choice(
            seq(optional(choice('++', '--')), $.expression, choice('++', '--')),
            seq(choice('++', '--'), $.expression, optional(choice('++', '--')))
        ),
        
        binary_expression: $ => choice(
            prec.left(1, seq($.expression, '+', $.expression)),
            prec.left(1, seq($.expression, '-', $.expression)),
            prec.left(2, seq($.expression, '*', $.expression)),
            prec.left(2, seq($.expression, '/', $.expression)),
            prec.left(3, seq($.expression, '%', $.expression)),
            prec.left(3, seq($.expression, '==', $.expression)),
            prec.left(3, seq($.expression, '!=', $.expression)),
            prec.left(4, seq($.expression, '>', $.expression)),
            prec.left(4, seq($.expression, '>=', $.expression)),
            prec.left(4, seq($.expression, '<', $.expression)),
            prec.left(4, seq($.expression, '<=', $.expression)),
            prec.left(5, seq($.expression, '&&', $.expression)),
            prec.left(6, seq($.expression, '||', $.expression))
        ),
        
        unary_expression: $ => choice(
            prec.left(7, seq('-', $.expression)),
            prec.left(7, seq('!', $.expression))
        ),

        constructor_expression: $ => seq(
            $.templated,
            $.argument_list
        ),

        call_expression: $ => seq(
            $.expression,
            $.argument_list
        ),

        list_expression: $ => seq(
            $.expression,
            $.list_accessor
        ),
        
        member_expression: $ => prec.left(8, seq(
            $.expression,
            choice(
                '.',
                '->',
            ),
            $.identifier
        )),

        accessor_expression: $ => prec.left(8, seq(
            $.identifier,
            '::',
            $.identifier
        )),

        bracketed_expression: $ => seq(
            '{',
            commaSep1($.expression),
            '}'
        ),
        inline_ifelse_expression: $ => seq(
            $.expression,
            '?',
            $.expression,
            ':',
            $.expression
        ),
        cast_expression: $ => seq('(',$.type_annotation,')',$.expression),
        this_expression: $ => 'this',

        super_expression: $ => 'super',

        argument_list: $ => seq(
          '(',
          optional(commaSep1($.expression)),
          ')'
        ),

        list_accessor: $ => seq(
            '[',
            choice($.expression, $.literal),
            ']'
        ),

        identifier: $ => /[A-z_]+/,
        templated: $ => prec.left(4,seq(
            $.identifier,
            '<',
            commaSep1($.type_annotation),
            '>',
            optional(repeat('*'))
        )),

        type_annotation: $ => choice(
            seq($.identifier, repeat1('*')),
            $.templated,
            $.identifier
        ),
        
        comment: $ => token(prec(-1, choice(
            seq('//', /.*/),
            seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
        )))
    }
});

function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}