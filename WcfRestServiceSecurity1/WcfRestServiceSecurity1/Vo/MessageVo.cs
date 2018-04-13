using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MoblieRestService.Vo
{
    public class MessageVo
    {
        public int ConsultID {
            get;set;
        }
        public string Message
        {
            get; set;
        }
        public int UserID
        {
            get; set;
        }
    }
}