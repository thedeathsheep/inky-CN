/*
	返回列表中元素的随机子集。

	若源列表为空则返回空列表 ()。也可能返回 ()！

	依赖： 

		需要 "pop" 函数。

	用法： 

		LIST fruitBowl = (apple), (banana), (melon)

		我装进包里：{list_random_subset(fruitBowl)}。 



*/

=== function list_random_subset(sourceList) 
    ~ temp el = pop(sourceList) 
    {el:
        { RANDOM(0,1) == 0: 
            ~ el = () 
        }
        ~ return el + list_random_subset(sourceList) 
    }
    ~ return () 
