/*
	从列表中随机取一个元素并返回，同时修改原列表。

	若源列表为空则返回空列表 ()。

	用法： 

	LIST fruitBowl = (apple), (banana), (melon)

	我吃了 {pop_random(fruitBowl)}。碗里现在还有 {fruitBowl}。

*/

=== function pop_random(ref _list) 
    ~ temp el = LIST_RANDOM(_list) 
    ~ _list -= el
    ~ return el 
 
