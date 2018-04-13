using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;
using System.Net;
using System.IO;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;

public class Sms
{
    //输出LOG
    private static void AddLog(string line)
    {
        try
        {
            string LogName = "Log.txt";
            FileStream fs = new FileStream(Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, LogName), FileMode.OpenOrCreate, FileAccess.Write);
            StreamWriter m_streamWriter = new StreamWriter(fs);
            m_streamWriter.BaseStream.Seek(0, SeekOrigin.End);
            m_streamWriter.WriteLine(line);
            m_streamWriter.Flush();
            m_streamWriter.Close();
            fs.Close();
        }
        catch (Exception ex)
        {
            throw ex;
        }
    }
    
    //河南短信字段
    public static object[] HnSms()
    {
        object[] Param = new object[6];
        Param[0] = "602508";
        Param[1] = "远程医学中心";
        Param[2] = "60250804";
        Param[3] = "病理诊断平台";
        Param[6] = "48";
        return Param;
    }
    
    //医院发送给专家-分配员发送给专家
    public static string Message1(string Phone, string CaseNo, string ExpName, string SendHos)
    {

        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";
            //医院直接发给专家或者分配员发给专家
            if (ConfigurationManager.AppSettings["VersionHn"] == "1")
            {
                int message;
                object ret = new object();
                string SmsUrl = ConfigurationManager.AppSettings["UpLoadAddress"];
                object[] Param = HnSms();
                value = string.Format("" + ConfigurationManager.AppSettings["HnMessage"] + "", ExpName, SendHos, CaseNo);
                Param[4] = Phone;
                Param[5] = value;
                int error = getWebServer.GetWebServiceDataWSDL(SmsUrl, "SMSINTO", "ServiceSms", Param, ref ret);
                if (error == 0)
                {
                    str = (string)ret;
                }
                else
                {
                    str = "0";
                }
            }
            else
            {
                value = string.Format("" + ConfigurationManager.AppSettings["Message"] + "", ExpName, SendHos, CaseNo);
                string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
                WebClient _WebClient = new WebClient();
                str = _WebClient.DownloadString(url);
            }
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }
    
    //医院发送给分配员
    public static string Message2(string Phone, string CaseNo, string DisplayName, string SendHos)
    {
        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";
            if (ConfigurationManager.AppSettings["VersionHn"] == "1")
            {
                int message;
                object ret = new object();
                string SmsUrl = ConfigurationManager.AppSettings["UpLoadAddress"];
                object[] Param = HnSms();
                value = string.Format("" + ConfigurationManager.AppSettings["HnCenter"] + "", DisplayName, SendHos, CaseNo);
                Param[4] = Phone;
                Param[5] = value;
                int error = getWebServer.GetWebServiceDataWSDL(SmsUrl, "SMSINTO", "ServiceSms", Param, ref ret);
                if (error == 0)
                {
                    str = (string)ret;
                }
                else
                {
                    str = "0";
                }
            }
            else
            {
                value = string.Format("" + ConfigurationManager.AppSettings["PpyMessage"] + "", DisplayName, SendHos, CaseNo);
                string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
                WebClient _WebClient = new WebClient();
                str = _WebClient.DownloadString(url);
            }
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }
    
    //医院抄送给中心
    public static string Message3(string Phone, string CaseNo, string SendHos)
    {
        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";
            value = string.Format("" + ConfigurationManager.AppSettings["CenterMessage"] + "", SendHos, CaseNo);
            string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
            WebClient _WebClient = new WebClient();
            str = _WebClient.DownloadString(url);
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }
    
    //医院冰冻发送给专家
    public static string Message4(string Phone, string OperationPart, string YuPhone, string ExpName, string HisName, string SBookTime)
    {
        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";
            if (ConfigurationManager.AppSettings["VersionHn"] == "1")
            {
                int message;
                object ret = new object();
                string SmsUrl = ConfigurationManager.AppSettings["UpLoadAddress"];
                object[] Param = HnSms();
                value = string.Format("" + ConfigurationManager.AppSettings["HnExpFrozen"] + "", ExpName, HisName, SBookTime, OperationPart, YuPhone);
                Param[4] = Phone;
                Param[5] = value;
                int error = getWebServer.GetWebServiceDataWSDL(SmsUrl, "SMSINTO", "ServiceSms", Param, ref ret);
                if (error == 0)
                {
                    str = (string)ret;
                }
                else
                {
                    str = "0";
                }
            }
            else
            {
                value = string.Format("" + ConfigurationManager.AppSettings["MessageFrozen"] + "", ExpName, OperationPart, YuPhone, HisName, SBookTime);
                string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
                WebClient _WebClient = new WebClient();
                str = _WebClient.DownloadString(url);
            }
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }
    
    //医院冰冻抄送中心
    public static string Message5(string Phone, string OperationPart, string YuPhone, string HisName, string SBookTime)
    {
        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";
            value = string.Format("" + ConfigurationManager.AppSettings["CenterMessageFrozen"] + "", OperationPart, YuPhone, HisName, SBookTime);
            string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
            WebClient _WebClient = new WebClient();
            str = _WebClient.DownloadString(url);
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }
    
    //分配员冰冻发送专家
    public static string Message6(string Phone, string OperationPart, string YuPhone, string ExpName, string HisName, string SBookTime)
    {
        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";
            value = string.Format("" + ConfigurationManager.AppSettings["MessageFrozen"] + "", ExpName, OperationPart, YuPhone, HisName, SBookTime);
            string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
            WebClient _WebClient = new WebClient();
            str = _WebClient.DownloadString(url);
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }
    
    //专家确认后发送医院-发布员发布发送医院
    public static string Message7(string Phone, string HisName, string DisplayName, string Case_No)
    {
        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";
            if (ConfigurationManager.AppSettings["VersionHn"] == "1")
            {
                int message;
                object ret = new object();
                string SmsUrl = ConfigurationManager.AppSettings["UpLoadAddress"];
                object[] Param = HnSms();
                value = string.Format("" + ConfigurationManager.AppSettings["HnDiagnosis"] + "", HisName, Case_No, DisplayName);
                Param[4] = Phone;
                Param[5] = value;
                int error = getWebServer.GetWebServiceDataWSDL(SmsUrl, "SMSINTO", "ServiceSms", Param, ref ret);
                if (error == 0)
                {
                    str = (string)ret;
                }
                else
                {
                    str = "0";
                }
            }
            else
            {
                value = string.Format("" + ConfigurationManager.AppSettings["ReportMessage"] + "", HisName, DisplayName, Case_No);
                string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
                WebClient _WebClient = new WebClient();
                str = _WebClient.DownloadString(url);
            }
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }
    
    //专家冰冻确认发送医院
    public static string Message8(string Phone, string HisName, string DisplayName, string YuName, string SBookTime)
    {
        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";
            value = string.Format("" + ConfigurationManager.AppSettings["CheckMessageFrozen"] + "", HisName, DisplayName, YuName, SBookTime);
            string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
            WebClient _WebClient = new WebClient();
            str = _WebClient.DownloadString(url);
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }
    
    //医院发送给分配员
    public static string Message9(string Phone, string CaseNo, string DisplayName, string SendHos)
    {
        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";

            value = string.Format("" + ConfigurationManager.AppSettings["ChangeMessage"] + "", DisplayName, SendHos, CaseNo);
            string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
            WebClient _WebClient = new WebClient();
            str = _WebClient.DownloadString(url);
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }
    
    //专家发给发布员短信
    public static string Message10(string Phone, string FbyDisplayName, string DisplayName, string Case_No)
    {
        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";
            value = string.Format("" + ConfigurationManager.AppSettings["FbyMessage"] + "", FbyDisplayName, DisplayName, Case_No);
            string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
            WebClient _WebClient = new WebClient();
            str = _WebClient.DownloadString(url);
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }
    
    //专家退回给站点
    public static string Message11(string Phone, string HisName, string DisplayName, string Case_No)
    {
        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";
            if (ConfigurationManager.AppSettings["VersionHn"] == "1")
            {
                int message;
                object ret = new object();
                string SmsUrl = ConfigurationManager.AppSettings["UpLoadAddress"];
                object[] Param = HnSms();
                value = string.Format("" + ConfigurationManager.AppSettings["ReturnHis"] + "", HisName, Case_No, DisplayName);
                Param[4] = Phone;
                Param[5] = value;
                int error = getWebServer.GetWebServiceDataWSDL(SmsUrl, "SMSINTO", "ServiceSms", Param, ref ret);
                if (error == 0)
                {
                    str = (string)ret;
                }
                else
                {
                    str = "0";
                }
            }
            else
            {
                value = string.Format("" + ConfigurationManager.AppSettings["ReturnMessage"] + "", HisName, DisplayName, Case_No);
                string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
                WebClient _WebClient = new WebClient();
                str = _WebClient.DownloadString(url);
            }
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }
    
    //复核
    public static string Message12(string Phone, string HisName, string DisplayName, string Case_No)
    {
        string str = "";
        try
        {
            string UserName = ConfigurationManager.AppSettings["UserName"];
            string PassWord = ConfigurationManager.AppSettings["PassWord"];
            string value = "";
            if (DisplayName == "")
            {

                value = string.Format("" + ConfigurationManager.AppSettings["PpyReportRMessage"] + "", HisName, Case_No);
            }
            else
            {
                value = string.Format("" + ConfigurationManager.AppSettings["PpyReportMessage"] + "", HisName, DisplayName, Case_No);
            }
            string url = "http://www.smsbao.com/sms?u=" + UserName + "&p=" + PassWord + "&m=" + Phone + "&c=" + value + "";
            WebClient _WebClient = new WebClient();
            str = _WebClient.DownloadString(url);
        }
        catch (Exception ex)
        {
            AddLog(ex.ToString());
            str = "1";
        }
        return str;
    }

}

