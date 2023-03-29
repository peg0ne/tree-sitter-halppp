module.exports = grammar({
    name: "halppp",
    
    conflicts: $ => [
        [$.class_constructor, $.type_annotation]
    ],

    rules: {
        program: $ => repeat(
            choice(
                $.import_statement,
                $.include_statement,
                $.class_declaration,
                $.enum_declaration,
                $.glob_declaration,
                $.method_definition,
            )),
        
        _include: $ => /[A-z_\.\"\/]+/,
        _get: $ => /[A-z_\[\/]+/,
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
            'class',
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
                $.class_property
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
            'if', $.expression, $.block,
            optional(repeat(
                seq('elif', $.expression, $.block)
            )),
            optional(seq('else', '\n', $.block))
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
                seq('\n', repeat($.expression_statement), $.break_statement)
            )
        ),
        general_do_statement: $ => seq(
            choice(
                'do', 'dobr',
                'dore', 'doco',
                'doremi'
            ),
            $.expression_statement
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
        expression: $ => choice(
            $.variable,
            $.literal,
            $.accessor_expression,
            $.assignment_expression,
            $.binary_expression,
            $.bracketed_expression,
            $.unary_expression,
            $.constructor_expression,
            $.call_expression,
            $.member_expression,
            $.this_expression,
            $.super_expression
        ),
        variable: $ => $.identifier,
        literal: $ => choice($.number, $.string, $.boolean, $.null),
        number: $ => /\d+(\.\d+)?/,
        string: $ => /\"[^\"]*\"/,
        boolean: $ => choice('true', 'false'),
        null: $ => choice('null','NULL','nullptr'),
        
        assignment_expression: $ => prec.right(seq(
            $.identifier,
            '=',
            $.expression
        )),
        
        binary_expression: $ => choice(
            prec.left(1, seq($.expression, '+', $.expression)),
            prec.left(1, seq($.expression, '-', $.expression)),
            prec.left(2, seq($.expression, '*', $.expression)),
            prec.left(2, seq($.expression, '/', $.expression)),
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

        this_expression: $ => 'this',

        super_expression: $ => 'super',

        argument_list: $ => seq(
          '(',
          optional(commaSep1($.expression)),
          ')'
        ),

        identifier: $ => /[A-z_]+/,
        templated: $ => prec.left(4,seq(
            $.identifier,
            '<',
            commaSep1($.type_annotation),
            '>'
        )),

        type_annotation: $ => choice(
            seq($.identifier, '*'),
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