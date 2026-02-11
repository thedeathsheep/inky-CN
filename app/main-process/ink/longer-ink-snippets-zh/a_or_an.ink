/*
	在名词前输出正确的不定冠词形式（英文 a/an）。
	注意：此函数为英文设计，中文无需冠词。

    Usage (英文): 

    VAR firstAnimal = "cat"
    VAR secondAnimal = "elephant"
    VAR thirdAnimal = "elongated badger"
    I put {a(firstAnimal)} and {a(secondAnimal)} into {a("{~old|nice} box")} with {a(thirdAnimal)}.



*/


=== function a(x)
    ~ temp stringWithStartMarker = "^" + x
    { stringWithStartMarker ? "^a" or stringWithStartMarker ? "^A" or stringWithStartMarker ? "^e" or  stringWithStartMarker ? "^E"  or stringWithStartMarker ? "^i" or stringWithStartMarker ? "^I"  or stringWithStartMarker ? "^o" or stringWithStartMarker ? "^O" or stringWithStartMarker ? "^u"  or stringWithStartMarker ? "^U"  :
            an {x}
            
    // 可扩展以支持 "an historic..." 等
    - else:
        a {x}
    }
