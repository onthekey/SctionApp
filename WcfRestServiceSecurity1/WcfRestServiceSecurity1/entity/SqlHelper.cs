using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MoblieRestService.entity
{
    class SqlHelper
    {
        public static string listToString(List<string> list)
        {
            string result = "";
            int i = 0;
            while (i < list.Count)
            {
                result += "'" + list[i] + "'";
                int j = i + 1;
                if (j != list.Count)
                {
                    result += ",";
                }

                i++;
            }
            return result;
        }

        public static string IntListToString(List<int> list)
        {
            string result = "";
            int i = 0;
            while (i < list.Count)
            {
                result += "'" + list[i] + "'";
                int j = i + 1;
                if (j != list.Count)
                {
                    result += ",";
                }

                i++;
            }
            return result;
        }
    }
}