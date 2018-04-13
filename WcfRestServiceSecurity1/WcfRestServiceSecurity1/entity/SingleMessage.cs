using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MoblieRestService.entity
{
    public class SingleMessage
    {
        string consultId;  
        string userId;  
        string message;

        public string ConsultId
        {
            get { return consultId; }
            set { consultId = value; }
        }

        public string UserId
        {
            get { return userId; }
            set { userId = value; }
        }

        public string Message
        {
            get { return message; }
            set { message = value; }
        }
    }
}