/*
	将文本转为大写。ink 本身无此功能。
	注意：主要用于西文，中文无大小写概念。

	用法： 

	"Give me wine. {UPPERCASE("Give me wine!")}
	
	所需 C# 代码：

	story.BindExternalFunction("UPPERCASE", (string txt) =>
	    {
	        return txt.ToUpper();
	    });
		
*/

EXTERNAL UPPERCASE(txt)
=== function UPPERCASE(txt)
    {txt}
	
