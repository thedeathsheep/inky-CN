/*
	对于带取值的列表，获取「下一个值」可能较复杂，因为可能不等于当前值 + 1。

	例如：

	LIST ComboMultipliers = (one = 1), (two = 2), (five = 5), (ten = 10), (twenty = 20), (hundred = 100)

	one + 1 == two 

	但 

	two + 1 == ()，因为没有对应 "3" 的列表值。

	以下两个函数可在列表中查找当前值的上一个/下一个值，若已是最大/最小值则返回 ()。

	因此： 
	LIST_PREV(five) == two 
	LIST_NEXT(ten) == twenty 

	且 

	LIST_PREV(one) = ()
	LIST_NEXT(hundred) = ()

*/

=== function LIST_PREV(listValue) 
	// 返回从当前到最大值范围内不在的最高值
    ~ return LIST_MAX(LIST_INVERT(LIST_RANGE(LIST_ALL(listValue),  listValue, LIST_MAX(LIST_ALL(listValue)))))

=== function LIST_NEXT(listValue) 
	// 返回从最小值到当前范围内不在的最低值
    ~ return LIST_MIN(LIST_INVERT(LIST_RANGE(LIST_ALL(listValue),  LIST_MIN(LIST_ALL(listValue)), listValue)))
