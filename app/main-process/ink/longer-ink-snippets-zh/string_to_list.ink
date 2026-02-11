
/*
	将字符串转换为指定列表中对应的列表元素。注意该元素此刻不必在列表变量中！ 

	适用于从游戏向 ink 传参：游戏可存储并传入列表元素的字符串 ID 作为参数。

	若未找到元素则返回空列表 ()。

	用法： 

	LIST capitalCities = Paris, London, NewYork

	~ temp thisCity = string_to_list("Paris", capitalCities)
	~ capitalCities += thisCity
	我已访问过 {thisCity}。

	优化说明：

	以下代码在 inky 中可用，但可外置为 C# 函数以提升性能：

	story.BindExternalFunction("STRING_TO_LIST", (string itemKey) => {
        try
        {
            return InkList.FromString(itemKey, story);
        }
        catch
        {
            return new InkList();
        }
    }, true);

*/

=== function string_to_list(stringElement, listSource)
    ~ temp retVal = STRING_TO_LIST(stringElement) 
    { USED_STRING_TO_LIST_FALLBACK:
    	~ retVal = stringAsPickedFromList(stringElement, LIST_ALL(listSource) ) 
    }
     ~ return retVal


EXTERNAL STRING_TO_LIST(stringElement) 
=== function STRING_TO_LIST(stringElement) 
    ~ return USED_STRING_TO_LIST_FALLBACK()

=== function USED_STRING_TO_LIST_FALLBACK() 
	// 此存根用于检测游戏是否使用外部函数
    ~ return     

// 回退：递归遍历 listToTry，尝试字符串匹配元素名
=== function stringAsPickedFromList(stringElement, listToTry)
    ~ temp minElement = LIST_MIN(listToTry) 
    {minElement:
        { stringElement == "{minElement}":
            ~ return minElement
        }
        ~ return stringAsPickedFromList(stringElement, listToTry - minElement)
    }       
    ~ return () 
