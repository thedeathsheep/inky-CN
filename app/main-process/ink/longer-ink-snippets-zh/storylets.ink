/* "Storylet" 实现。 

    基于 https://github.com/smwhr/ink-storylets/tree/main by smwhr。 
    
    将内容组织为「storylet」——小场景块，由前置条件控制。游戏从当前可用的前 N 个中提供选择。 
    
    逻辑轻量，数据与故事内容一体，便于扩展。 
    
*/



故事开始！

- (opts)
    // 选择前 2 个可用 storylet  
    <- listAvailableStorylets(2, -> opts) 
                    
    // 无可用时提供 fallback
    * ->            

-   无事可做了。 
    -> END

// 以下函数遍历 storylet 数据库，按优先级找可用项

VAR AvailableStorylets = ()

== listAvailableStorylets(max, -> backTo)
    ~ AvailableStorylets = ()
    ~ computeStorylets(LIST_ALL(Storylets), max)
    -> offerStorylets(AvailableStorylets, backTo)
 
== function computeStorylets(list, max)
    ~ temp current = LIST_MIN(list)
    { current && max > 0:
        ~ list -= current 
        ~ temp storyletFunction = StoryletDatabase(current)
    
        { storyletFunction(Condition): 
            ~ AvailableStorylets += current
            ~ max-- 
        }
        ~ computeStorylets(list, max)
    }

=== offerStorylets(list, -> backTo)===
    ~ temp current = LIST_MIN(list)  // 按 storylet 顺序
    {current:
        ~ list -= current
        ~ temp storyletFunction = StoryletDatabase(current)
        
        +   [{storyletFunction(ChoiceText)}]
            ~ temp whereTo = storyletFunction(Content) 
            -> whereTo -> backTo
    } 
    { list:
        -> offerStorylets(list, backTo)
    }
    -> DONE
    

// 数据库：将 storylet 的 LIST 值与其索引函数关联

LIST Props = Content, Condition, ChoiceText

LIST Storylets = StoryA, StoryB, StoryC         // 按优先级

=== function StoryletDatabase(storylet)
   { storylet:
   -  StoryA:   ~ return -> StoryletData_Avocado
   -  StoryB:   ~ return -> StoryletData_Bananas
   -  StoryC:   ~ return -> StoryletData_Crumpets
   }
  
// 故事内容：每个 storylet 是一个数据库函数/内容对

=== function StoryletData_Avocado(prop) 
    { prop: 
    -   ChoiceText: 拜访牛油果女巫
    -   Condition:  ~ return not witch_content  // 仅一次
    -   Content:    ~ return -> witch_content
    }
    
=== witch_content
    你拜访了女巫。 
    ->-> 



=== function StoryletData_Bananas(prop) 
    { prop: 
    -   ChoiceText:  见过国王后，拜访香蕉男孩！
    -   Condition:  ~ return not boy_content && king_content // 仅一次
    -   Content:    ~ return -> boy_content
    }
    
=== boy_content
    你拜访了男孩。
    ->-> 
    

=== function StoryletData_Crumpets(prop) 
    { prop: 
    -   ChoiceText: 拜访松饼国王
    -   Condition:  ~ return not king_content  // 仅一次
    -   Content:    ~ return -> king_content
    }
    
=== king_content
    你拜访了国王。 
    ->->
