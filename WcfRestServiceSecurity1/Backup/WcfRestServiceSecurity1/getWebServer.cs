using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Web.Services.Description;
using System.Xml.Serialization;
using System.CodeDom;
using System.Net;


class getWebServer
{
    public static int GetWebServiceDataWSDL(string url, string funcName, string className, Object[] parameters, ref Object retItem)
    {

        try
        {
            string @namespace = "KFBIO.Webservice.WSDL";

            System.Net.WebClient client = new System.Net.WebClient();
            //String classname;


            //String url = System.Configuration.ConfigurationManager.ConnectionStrings["serviceAddress"].ConnectionString;//这个地址可以写在Config文件里面，这里取出来就行了.在原地址后面加上： ?WSDL 
            //String url = "http://192.168.4.4:8090/yfy-client/services/Msg_Service";

            //String param = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><NOTICEMSG><MSGCONTENT><APPLICATION><INP_ID></INP_ID><INP_VISIT_TYPE_CD>1</INP_VISIT_TYPE_CD><NAME></NAME><GENDER_CD>2</GENDER_CD><BIRTHDATE> </BIRTHDATE><ID_NO></ID_NO><PATI_PHONE> </PATI_PHONE><PROVINCE_NAME> </PROVINCE_NAME><CITY_NAME> </CITY_NAME><AREA_NAME> </AREA_NAME><STREET_ID> </STREET_ID><VILLAGE_NAME> </VILLAGE_NAME><HOUSE_NO> </HOUSE_NO><APPLY_REASON>2</APPLY_REASON><CONSULT_AIM>远程诊断</CONSULT_AIM><ILLNESS_DIAG> </ILLNESS_DIAG><CONSULT_ORG_CODE> </CONSULT_ORG_CODE><CONSULT_ORG_NAME> </CONSULT_ORG_NAME></APPLICATION><EXAMSET><REPORT_NO> </REPORT_NO><REPORT_DATE> </REPORT_DATE><TEST_DEPT_NAME>病理科</TEST_DEPT_NAME><REPORT_DOC_NAME>牛爱芳</REPORT_DOC_NAME><ITEM_CD>00213564</ITEM_CD><ITEM_NAME>病理诊断</ITEM_NAME><CLINICDESC>送检目的</CLINICDESC><EXAMFINDING>检查所见</EXAMFINDING><EXAMCONCLUSION>检查结论</EXAMCONCLUSION><FTP_USER>FTP</FTP_USER><FTP_PASSWORD>1234</FTP_PASSWORD><FTP_FILEPATH> FTP文件完整路径</FTP_FILEPATH></EXAMSET></MSGCONTENT><CREATETIME>产生日期时间</CREATETIME></NOTICEMSG>";




            //classname = "Msg_Service";

            url = url + "?wsdl";

            Stream stream = client.OpenRead(url);

            ServiceDescription description = ServiceDescription.Read(stream);

            ServiceDescriptionImporter importer = new ServiceDescriptionImporter();//创建客户端代理代理类。  

            importer.ProtocolName = "Soap"; //指定访问协议。  
            importer.Style = ServiceDescriptionImportStyle.Client; //生成客户端代理。  
            importer.CodeGenerationOptions = CodeGenerationOptions.GenerateProperties | CodeGenerationOptions.GenerateNewAsync;

            importer.AddServiceDescription(description, null, null); //添加WSDL文档。

            CodeNamespace nmspace = new CodeNamespace(); //命名空间  
            nmspace.Name = @namespace;
            System.CodeDom.CodeCompileUnit unit = new System.CodeDom.CodeCompileUnit();
            unit.Namespaces.Add(nmspace);

            System.Web.Services.Description.ServiceDescriptionImportWarnings warning = importer.Import(nmspace, unit);
            System.CodeDom.Compiler.CodeDomProvider provider = System.CodeDom.Compiler.CodeDomProvider.CreateProvider("CSharp");

            System.CodeDom.Compiler.CompilerParameters parameter = new System.CodeDom.Compiler.CompilerParameters();
            parameter.GenerateExecutable = false;
            if (!Directory.Exists(System.Web.HttpContext.Current.Server.MapPath("Temp")))
            {
                Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath("Temp"));
            }
            parameter.OutputAssembly = System.Web.HttpContext.Current.Server.MapPath("Temp/") + "TempClass.dll"; //"D:/TempClass.dll";//输出程序集的名称  
            parameter.ReferencedAssemblies.Add("System.dll");
            parameter.ReferencedAssemblies.Add("System.XML.dll");
            parameter.ReferencedAssemblies.Add("System.Web.Services.dll");
            parameter.ReferencedAssemblies.Add("System.Data.dll");



            System.CodeDom.Compiler.CompilerResults result = provider.CompileAssemblyFromDom(parameter, unit);
            if (result.Errors.HasErrors)
            {
                // 显示编译错误信息  
                //临时模板编译错误，内部错误
                string a = System.Web.HttpContext.Current.Server.MapPath("Temp/") + "TempClass.dll";
                if (!File.Exists(System.Web.HttpContext.Current.Server.MapPath("Temp/") + "TempClass.dll"))
                {
                    return -5;
                }

            }

            System.Reflection.Assembly asm = System.Reflection.Assembly.LoadFrom(System.Web.HttpContext.Current.Server.MapPath("Temp/") + "TempClass.dll");//加载前面生成的程序集  
            //Type t = asm.GetType(nameSpace + "." + className);  
            Type t = asm.GetType(@namespace + "." + className);

            object o = Activator.CreateInstance(t);
            System.Reflection.MethodInfo method = t.GetMethod(funcName);//CONSULTAPPLYNOTICE_PATHOLOGY是服务端的方法名称,你想调用服务端的什么方法都可以在这里改,最好封装一下  


            retItem = method.Invoke(o, parameters);
        }
        catch (WebException ex)
        {
            //网络异常异常
            return -1;
        }
        catch (Exception ex)
        {
            //未知错误
            return -99;
        }

        return 0;
    }
}

