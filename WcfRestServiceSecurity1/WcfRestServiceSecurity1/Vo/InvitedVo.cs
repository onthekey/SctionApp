using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MoblieRestService.Vo
{
    public class InvitedVo
    {
        public int ConsultID
        {
            get; set;
        }
        public int FromExpID
        {
            get; set;
        }
        public string Reason
        {
            get; set;
        }
        public int ToExpID
        {
            get; set;
        }
        public string Diagnosis {
            get;
            set;
        }
        public string DiagnosisTime
        {
            get;
            set;
        }

    }
}