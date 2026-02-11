/*
	返回列表中元素的随机子集，最多指定数量。

	若源列表为空则返回空列表 ()；若可取元素不足则返回完整列表。

	依赖： 

		需要 "pop_random" 函数。

	用法： 

		LIST fruitBowl = (apple), (banana), (melon)

		我装进包里：{list_random_subset_of_size(fruitBowl, 2)}。 



*/

=== function list_random_subset_of_size(sourceList, n) 
    { n > 0:
        ~ temp el = pop_random(sourceList) 
        { el: 
            ~ return el + list_random_subset_of_size(sourceList, n-1)
        }
    }
    ~ return () 
 
