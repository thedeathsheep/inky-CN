/*
	将列表用逗号格式化输出。

	依赖： 

		依赖 "pop" 函数。

	用法： 

		LIST fruitBowl = (apples), (bananas), (oranges)

		碗里有 {list_with_commas(fruitBowl)}。
*/

=== function list_with_commas(list)
	{ list:
		{_list_with_commas(list, LIST_COUNT(list))}
	}

=== function _list_with_commas(list, n)
	{pop(list)}{ n > 1:{n == 2: 和 |、}{_list_with_commas(list, n-1)}}
