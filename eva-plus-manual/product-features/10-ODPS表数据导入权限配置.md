# ODPS 表数据导入权限配置

---

从 ODPS 表导入数据前，需将相关表权限授予 A+ 公共开发账号：bssxubjmnmzw@aliyun.com

## 通过安全卫士申请

### 未开启项目保护的项目

在安全卫士中，为 A+ 公共开发账号 bssxubjmnmzw@aliyun.com 申请相关表的访问权限。

### 开启项目保护的项目

如果出现"申请项目开启了保护，仅允许在使用项目中访问数据"，则需要先申请"aplus_data_middle_layer"项目的权限，然后再"使用项目"中选择"aplus_data_middle_layer"

> **申请权限后 odps 的权限同步存在一定时间的延迟，请等半个小时后再导入！！！**
