/*
	判断 ink 变量的类型。作者：@IFcoltransG（inkle discord）


	用法： 

	VAR x = "你好！"
	VAR y = 14 
	LIST z = (Hat), (Coat)

	{type_of(x) == Number:
		这是数字，可以安全地除以 2。 
		{x / 2}
	} 
	
		
*/


LIST Type = List, String, Number, Bool
=== function type_of(val)
    {"{val + val}":
        - "{val}{val}":
            {val ? val:
                ~ return String
            - else: 
                ~ return List // 空
            }
            
        - "{val}":
            { "{val}" == "0":
                ~ return Number // 零
            - else: 
                ~ return List
            }
         
        - else:
            {"{not not val}" == "{val}":
                ~ return Bool 
            }
            ~ return Number
    }
