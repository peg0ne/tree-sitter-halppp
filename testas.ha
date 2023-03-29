enum L
    A,
    B
;

fn main =>
    let t = L::B
    switch t
    case L::A do print("a")
    case L::B do print("b")
    ;
;