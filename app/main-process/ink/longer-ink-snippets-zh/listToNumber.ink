/*  

    将整数值分配给、读取和修改列表项的系统。 

    可为物品分配数量（如背包物品）或玩家属性值。
    
*/


LIST Wallet = Coins, Notes, Cards 

~ _setValueOfState(Coins, 3) // 玩家有 3 枚硬币 
~ _setValueOfState(Cards, 2) // 玩家有 2 张卡

我现在有 {_getValueOfState(Coins)} 枚硬币和 {_getValueOfState(Cards)} 张卡。

~ _alterValueForState(Coins, 10)

现在我有 {_getValueOfState(Coins)}。

~ _alterValueForState(Cards, 30)
~ _alterValueForState(Cards, -60)

现在我有 {_getValueOfState(Cards)}。哎呀！

-> END


  
// 1) 存储空间  
VAR StatesNegative = () // 记录哪些状态当前为负值
VAR StatesBinary1 = ()
VAR StatesBinary2 = ()
VAR StatesBinary4 = ()
VAR StatesBinary8 = ()
VAR StatesBinary16 = ()
VAR StatesBinary32 = ()
VAR StatesBinary64 = ()
VAR StatesBinary128 = ()
VAR StatesBinary256 = ()
VAR StatesBinary512 = ()
VAR StatesBinary1024 = ()
VAR StatesBinary2048 = ()   // 可存储至 4095，添加更多状态可扩展
// --> ADDITIONAL STORAGE GOES HERE

CONST MAX_BINARY_BIT = 2048

VAR StatesInStorage = ()

  
// 2) 获取状态值

    
=== function _getValueOfState(id) // always single 
    ~ temp value = 0 
    ~ value += (StatesBinary1 ? id) * 1
    ~ value += (StatesBinary2 ? id) * 2
    ~ value += (StatesBinary4 ? id) * 4
    ~ value += (StatesBinary8 ? id) * 8
    ~ value += (StatesBinary16 ? id) * 16
    ~ value += (StatesBinary32 ? id) * 32
    ~ value += (StatesBinary64 ? id) * 64
    ~ value += (StatesBinary128 ? id) * 128
    ~ value += (StatesBinary256 ? id) * 256
    ~ value += (StatesBinary512 ? id) * 512
    ~ value += (StatesBinary1024 ? id) * 1024
    ~ value += (StatesBinary2048 ? id) * 2048
// --> ADDITIONAL STORAGE GOES HERE
    { StatesNegative ? id: 
            ~ value = value * -1
    }
    ~ return value 
    

// 3) 设置状态值   
    
=== function _setValueOfState(state, value) // always single 
    { value >= 2 * MAX_BINARY_BIT || value <= -2 * MAX_BINARY_BIT: 
        [ ERROR - 尝试为 {state} 存储 {value}，超出空间。请增加 {MAX_BINARY_BIT} 并添加更多存储。 ]
    }
    ~ temp currentValue = _getValueOfState(state)
    { currentValue != 0 && currentValue != value:
         ~ _removeValuesForState(state)
    }
    { value != 0:
        ~ StatesInStorage += state
        { value < 0: 
            ~ StatesNegative += state 
            ~ value = -1 * value         
        - else: 
            ~ StatesNegative -= state 
        }
        ~ _setBinaryValuesForState(state, value, MAX_BINARY_BIT )
    }


=== function _setBinaryValuesForState(id, value, binaryValue)
    { value >= binaryValue:
        ~ value -= binaryValue
        {binaryValue: 
        -  1:   ~ StatesBinary1 += id
        -  2:   ~ StatesBinary2 += id
        -  4:   ~ StatesBinary4 += id
        -  8:   ~ StatesBinary8 += id
        -  16:   ~ StatesBinary16 += id
        -  32:   ~ StatesBinary32 += id
        -  64:   ~ StatesBinary64 += id
        -  128:   ~ StatesBinary128 += id
        -  256:   ~ StatesBinary256 += id
        -  512:   ~ StatesBinary512 += id
        -  1024:   ~ StatesBinary1024 += id
        -  2048:   ~ StatesBinary2048 += id
        }
// --> ADDITIONAL STORAGE LINES GO HERE
    }
    { binaryValue > 1: 
        ~ _setBinaryValuesForState(id, value, binaryValue / 2)
    }


// 4) 移除

=== function _removeValuesForState(state)
    ~ StatesInStorage -= state
    ~ StatesNegative -= state
    ~ StatesBinary1 -= state
    ~ StatesBinary2 -= state
    ~ StatesBinary4 -= state
    ~ StatesBinary8 -= state
    ~ StatesBinary16 -= state
    ~ StatesBinary32 -= state
    ~ StatesBinary64 -= state
    ~ StatesBinary128 -= state
    ~ StatesBinary256 -= state
    ~ StatesBinary512 -= state
    ~ StatesBinary1024 -= state
    ~ StatesBinary2048 -= state

// 5) 修改状态值

=== function _alterValueForState(state, delta)
    ~ _setValueOfState(state, _getValueOfState(state) + delta)
