/*
	从列表中取出最后一个元素并返回，同时修改原列表。

	若源列表为空则返回空列表 ()。

	用法： 

	LIST fruitBowl = (apple), (banana), (melon)

	我吃了 {pop(fruitBowl)}。碗里现在还有 {fruitBowl}。

*/

=== function pop(ref _list) 
    ~ temp el = LIST_MIN(_list) 
    ~ _list -= el
    ~ return el 
