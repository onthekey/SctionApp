using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using FluentData;

namespace MoblieRestService.datebase
{
    /**
     * DbContext包装单例，用于支持数据库的操作，将IDbContext封装在内部已保持久化
     * 通过隐藏构造方法并开放一个get()方式使DBConetxt能够只需要初始化一次并能够
     * 获取与应用相同的生命周期
     */
    class DBContext
    {
        // 内部自申明
        private static DBContext dbConetxt;

        // 内部实例化的资源声明
        private IDbContext iDBContext;

        // 隐藏私有化自己的构造方法， 可以在构造方法中添加需要的资源与类的实例化使其保持持久性与唯一性
        private DBContext()
        {
            // 实例化iDbContext, 适用与Mysql的连接
            //iDBContext = new DbContext().ConnectionStringName("KSMSYS", new SqlServerProvider());
        }

        // 外部实例化接口
        public static DBContext get()
        {
            if (dbConetxt == null)
            {
                dbConetxt = new DBContext();
            }
            return dbConetxt;
        }

        /**
         * 获取实例化的iDbContext，当过单例封装整个iDbContext环境
         * iDbContext因为DBContext拥有持久的生命周期
         */
        public IDbContext getIDbContext()
        {
            // 实例化iDbContext, 适用与Mysql的连接
            iDBContext = new DbContext().ConnectionStringName("mobileConnString", new SqlServerProvider());
            return this.iDBContext;
        }
    }
}