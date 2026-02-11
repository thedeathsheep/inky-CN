/*
	检查列表项是否属于某列表？若测试 () 则返回 false。

	用法： 

	LIST Fruits = apple, banana, melon
	LIST Veggies = carrot, cucumber 

	~ temp x = apple
	我吃的是 {list_item_is_member_of(x, Fruits):水果|蔬菜}。

*/

=== function list_item_is_member_of(k, list) 
   	~ return k && LIST_ALL(list) ? k
