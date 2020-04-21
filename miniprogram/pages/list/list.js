const app=getApp();
Page({
  data: {
    list:[],
    collection:'list',
    chatCollection:'message',
    groupId:'',
    resizeIndex:-1,
    unLoginIcon:'/images/unloginIcon.png',
    listUnSelectStyle:'list_box',
    listSelectStyle:'list_resizeBox',
    regExp:'',
    openid:'',
    userInfo:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  getOpenid: function () {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        this.setData({
          openid: res.result.openid
        })
      }
    })
  },
  getAuth: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    else {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: res => {
                this.setData({
                  userInfo: res.userInfo
                })
              }
            })
          }
        }
      })
    }
  },
  toChat:function(e){
    wx.showLoading({
      title: '连接中...',
      mask:true
    })
    const db=wx.cloud.database();
    const { chatCollection,openid,userInfo}=this.data;
    let host=e.currentTarget.dataset.openid
    let hostIcon = e.currentTarget.dataset.icon;
    let hostName = e.currentTarget.dataset.name;
    let visitor = openid;
    let visitorName = userInfo.nickName; 
    let visitorIcon = userInfo.avatarUrl;
    if (host == visitor){
      wx.hideLoading();
      wx.showToast({
        title: '连接失败，请勿与自己联系!',
        icon:"none"
      })
    }else{
      db.collection(chatCollection).add({
        data: {
          information: {
            _openids: {
              host: openid,
              hostIcon: hostIcon,
              hostName: hostName,
              visitor: visitor,
              visitorIcon: visitorIcon,
              visitorName: visitorName
            },
            unread: 0
          },
          messages: []
        }
      })
    }
  },
  search:function(e){
    let reg;
    if(e.detail.value==''){
      reg=''
    }
    else{
      reg = '^.*' + e.detail.value + '.*$';
    }
    console.log(reg,typeof(reg))
    this.setData({
      regExp:reg
    })
    this.getData()
  },
  viewImgs:function(e){
    let getList=this.data.list.filter(res=>{
      return res._id == e.target.dataset.id
    })
    console.log(getList[0])
    wx.previewImage({
      current: getList[0].imgId[e.target.dataset.index],
      urls: getList[0].imgId,
      success: res => {
        console.log('成功',res);
      },
      fail:res=>{
        console.log('失败',res)
      }
    })
  },
  getData:function(){
    //获取数据
    const { collection,regExp } = this.data;
    const db = wx.cloud.database();
    const _ = db.command;//暂时无用

    if (regExp!=''){//如果有搜索条件就采用正则表达式拉取数据
    //清空list
      this.setData({
        list:[]
      })
      //两次查询，一次查询title，一次查询content
      db.collection(collection).where({
        content: db.RegExp({
          regexp: regExp,
          options: 'i'
        })
      }).get({
        success: res => {
          let newlist = this.data.list;
          newlist =newlist.concat(res.data)
          this.setData({
            list: newlist
          })

        }
      })
      db.collection(collection).where({
        title: db.RegExp({
          regexp: regExp,
          options: 'i'
        })
      }).get({
        success: res => {
          let newlist=this.data.list;
          newlist=newlist.concat(res.data)
          this.setData({
            list: newlist
          })

        }
      })
    }
    else{//否则搜索全部数据
      db.collection(collection).where({}).get({
        success: res => {
          console.log(res);
          let newres=res.data.reverse();
          this.setData({
            list: newres
          })

        }
      })
    }
  },
  //用来锁定聚焦放大的信息窗口
  resize:function(e){
    if (this.data.resizeIndex == e.currentTarget.dataset.index){
      this.setData({
        resizeIndex: -1
      })
    }
    else{
      this.setData({
        resizeIndex: e.currentTarget.dataset.index
      })
    }
  },
  toPublish:function(){
    wx.navigateTo({
      url: '/pages/publish/publish',
    })
  },
  onLoad: function (options) {
    this.getAuth();
    this.getOpenid();
    this.getData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  //上传成功返回页面时刷新页面
  onShow: function () {
    setTimeout(this.getData,300);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getData();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})