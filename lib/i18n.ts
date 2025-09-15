'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// Hệ thống đa ngôn ngữ cho ứng dụng Proxy Manager
export type Language = 'vi' | 'en'

export interface TranslationKeys {
  // Common
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    confirm: string
    save: string
    delete: string
    edit: string
    add: string
    remove: string
    refresh: string
    search: string
    filter: string
    clear: string
    apply: string
    close: string
    back: string
    next: string
    previous: string
    yes: string
    no: string
    all: string
    none: string
    select: string
    selected: string
    total: string
    actions: string
    status: string
    type: string
    host: string
    port: string
    username: string
    password: string
    country: string
    anonymity: string
    notes: string
    performance: string
    ping: string
    speed: string
    lastTested: string
    group: string
    alive: string
    dead: string
    pending: string
    testing: string
    unknownStatus: string
    fast: string
    medium: string
    slow: string
    transparent: string
    anonymous: string
    elite: string
    http: string
    https: string
    socks4: string
    socks5: string
    httpConnect: string
    httpsConnect: string
    socks4a: string
    ssh: string
    sshTunnel: string
    openvpn: string
    wireguard: string
    l2tp: string
    pptp: string
    ikev2: string
    residential: string
    datacenter: string
    mobile: string
    isp: string
    static: string
    rotating: string
    ftp: string
    smtp: string
    pop3: string
    imap: string
    telnet: string
    cloudflare: string
    cloudfront: string
    fastly: string
    tor: string
    i2p: string
    freenet: string
    gaming: string
    streaming: string
    cdn: string
    enterprise: string
    corporate: string
    firewall: string
    custom: string
    unknown: string
    debug: string
    noSelection: string
    inactive: string
  }
  
  // Navigation
  navigation: {
    dashboard: string
    proxyList: string
    optimizedList: string
    performance: string
    massValidator: string
    smartRotation: string
    realtimeTest: string
    multitest: string
    stats: string
    settings: string
    help: string
  }
  
  // Dashboard
  dashboard: {
    title: string
    description: string
    totalProxies: string
    aliveProxies: string
    deadProxies: string
    pendingProxies: string
    optimizationScore: string
    recommendations: string
    predictions: string
    lastAnalysis: string
    autoAnalysis: string
    analyzeNow: string
    performance: string
    usage: string
    reliability: string
    improving: string
    stable: string
    declining: string
    increasing: string
    decreasing: string
    criticalIssues: string
    quickActions: string
    aiPowered: string
    effort: string
    low: string
    medium: string
    high: string
    excellent: string
    good: string
    fair: string
    needsImprovement: string
  }
  
  // Proxy List
  proxyList: {
    title: string
    addProxy: string
    importProxy: string
    exportProxy: string
    testSelected: string
    testAll: string
    deleteSelected: string
    selectAll: string
    deselectAll: string
    searchPlaceholder: string
    noProxiesFound: string
    noProxiesMessage: string
    tryDifferentFilters: string
    startByAdding: string
    showing: string
    of: string
    proxies: string
    selectColumn: string
    statusColumn: string
    typeColumn: string
    hostPortColumn: string
    credentialsColumn: string
    performanceColumn: string
    countryColumn: string
    anonymityColumn: string
    notesColumn: string
    actionsColumn: string
    showPassword: string
    hidePassword: string
    copyToClipboard: string
    noCredentials: string
    notTested: string
    testProxy: string
    editProxy: string
    deleteProxy: string
    confirmDelete: string
    confirmBulkDelete: string
    cannotUndo: string
    exportWithFilters: string
    importFile: string
    supportedFormats: string
    importSuccess: string
    importError: string
    fileReadError: string
    invalidFormat: string
    addNewProxy: string
    editProxyTitle: string
    proxyDetails: string
    proxyType: string
    proxyStatus: string
    proxyGroup: string
    proxyCountry: string
    proxyAnonymity: string
    proxyNotes: string
    saveChanges: string
    cancelEdit: string
  }
  
  // Filters
  filters: {
    allStatuses: string
    allTypes: string
    allAnonymity: string
    allCountries: string
    allGroups: string
    allPing: string
    allSpeed: string
    advancedFilters: string
    clearFilters: string
    applyFilters: string
    filterBy: string
    status: string
    type: string
    anonymity: string
    country: string
    group: string
    ping: string
    speed: string
    fastPing: string
    mediumPing: string
    slowPing: string
    fastSpeed: string
    mediumSpeed: string
    slowSpeed: string
  }
  

  
  // Performance
  performance: {
    title: string
    description: string
    systemPerformance: string
    proxyPerformance: string
    responseTime: string
    throughput: string
    errorRate: string
    uptime: string
    memoryUsage: string
    cpuUsage: string
    networkLatency: string
    bandwidth: string
    connections: string
    activeConnections: string
    totalConnections: string
    failedConnections: string
    successRate: string
    averageResponseTime: string
    peakResponseTime: string
    minResponseTime: string
    requestsPerSecond: string
    dataTransferred: string
    cacheHitRate: string
    optimizationSuggestions: string
    performanceMetrics: string
    realTimeMonitoring: string
    historicalData: string
    performanceReport: string
    exportReport: string
    performanceAlerts: string
    thresholdExceeded: string
    performanceDegraded: string
    systemOverloaded: string
    memoryLeak: string
    highLatency: string
    lowThroughput: string
    highErrorRate: string
  }
  
  // Forms
  forms: {
    required: string
    invalidFormat: string
    invalidEmail: string
    invalidUrl: string
    invalidPort: string
    invalidHost: string
    invalidPortRange: string
    passwordTooShort: string
    passwordTooLong: string
    usernameRequired: string
    passwordRequired: string
    hostRequired: string
    portRequired: string
    typeRequired: string
    statusRequired: string
    countryRequired: string
    anonymityRequired: string
    groupRequired: string
    notesOptional: string
    saveSuccess: string
    saveError: string
    updateSuccess: string
    updateError: string
    deleteSuccess: string
    deleteError: string
    validationError: string
    networkError: string
    serverError: string
    unknownError: string
  }
  
  // Modals
  modals: {
    confirmAction: string
    confirmDelete: string
    confirmBulkDelete: string
    confirmClear: string
    confirmReset: string
    confirmExport: string
    confirmImport: string
    confirmTest: string
    confirmOptimize: string
    confirmApply: string
    confirmDismiss: string
    confirmReplace: string
    confirmUpdate: string
    confirmSave: string
    confirmCancel: string
    confirmClose: string
    confirmBack: string
    confirmNext: string
    confirmPrevious: string
    confirmYes: string
    confirmNo: string
    confirmOk: string
  }
  
  // Messages
  messages: {
    welcome: string
    welcomeMessage: string
    gettingStarted: string
    gettingStartedMessage: string
    noData: string
    noDataMessage: string
    loadingData: string
    loadingDataMessage: string
    errorOccurred: string
    errorOccurredMessage: string
    successMessage: string
    successMessageText: string
    warningMessage: string
    warningMessageText: string
    infoMessage: string
    infoMessageText: string
    confirmMessage: string
    confirmMessageText: string
    errorMessage: string
    errorMessageText: string
  }
}

export const translations: Record<Language, TranslationKeys> = {
  vi: {
    common: {
      loading: 'Đang tải...',
      error: 'Lỗi',
      success: 'Thành công',
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      save: 'Lưu',
      delete: 'Xóa',
      edit: 'Chỉnh sửa',
      add: 'Thêm',
      remove: 'Xóa',
      refresh: 'Làm mới',
      search: 'Tìm kiếm',
      filter: 'Lọc',
      clear: 'Xóa',
      apply: 'Áp dụng',
      close: 'Đóng',
      back: 'Quay lại',
      next: 'Tiếp theo',
      previous: 'Trước đó',
      yes: 'Có',
      no: 'Không',
      all: 'Tất cả',
      none: 'Không có',
      select: 'Chọn',
      selected: 'Đã chọn',
      total: 'Tổng',
      actions: 'Thao tác',
      status: 'Trạng thái',
      type: 'Loại',
      host: 'Host',
      port: 'Port',
      username: 'Tên đăng nhập',
      password: 'Mật khẩu',
      country: 'Quốc gia',
      anonymity: 'Ẩn danh',
      notes: 'Ghi chú',
      performance: 'Hiệu suất',
      ping: 'Ping',
      speed: 'Tốc độ',
      lastTested: 'Lần test cuối',
      group: 'Nhóm',
      alive: 'Hoạt động',
      dead: 'Không hoạt động',
      pending: 'Chờ xử lý',
      testing: 'Đang test',
      unknownStatus: 'Không xác định',
      fast: 'Nhanh',
      medium: 'Trung bình',
      slow: 'Chậm',
      transparent: 'Trong suốt',
      anonymous: 'Ẩn danh',
      elite: 'Elite',
      http: 'HTTP',
      https: 'HTTPS',
      socks4: 'SOCKS4',
      socks5: 'SOCKS5',
      httpConnect: 'HTTP-Connect',
      httpsConnect: 'HTTPS-Connect',
      socks4a: 'SOCKS4A',
      ssh: 'SSH',
      sshTunnel: 'SSH Tunnel',
      openvpn: 'OpenVPN',
      wireguard: 'WireGuard',
      l2tp: 'L2TP',
      pptp: 'PPTP',
      ikev2: 'IKEv2',
      residential: 'Residential',
      datacenter: 'Datacenter',
      mobile: 'Mobile',
      isp: 'ISP',
      static: 'Static',
      rotating: 'Rotating',
      ftp: 'FTP',
      smtp: 'SMTP',
      pop3: 'POP3',
      imap: 'IMAP',
      telnet: 'Telnet',
      cloudflare: 'Cloudflare',
      cloudfront: 'CloudFront',
      fastly: 'Fastly',
      tor: 'Tor',
      i2p: 'I2P',
      freenet: 'Freenet',
      gaming: 'Gaming',
      streaming: 'Streaming',
      cdn: 'CDN',
      enterprise: 'Enterprise',
      corporate: 'Corporate',
      firewall: 'Firewall',
      custom: 'Custom',
      unknown: 'Unknown',
      debug: 'Debug Storage',
      noSelection: 'Chưa chọn',
      inactive: 'Không hoạt động'
    },
    
    navigation: {
      dashboard: 'Dashboard',
      proxyList: 'Danh sách Proxy',
      optimizedList: 'Proxy Tối ưu',
      performance: 'Hiệu suất',
      massValidator: 'Kiểm tra hàng loạt',
      smartRotation: 'Smart Rotation',
      realtimeTest: 'Test Real-time',
      multitest: 'Test & Quản lý URL',
      stats: 'Thống kê & Phân tích',
      settings: 'Cài đặt',
      help: 'Trợ giúp'
    },
    
    dashboard: {
      title: 'Proxy Manager',
      description: 'Ứng dụng quản lý và kiểm tra proxy chuyên nghiệp',
      totalProxies: 'Tổng proxy',
      aliveProxies: 'Proxy hoạt động',
      deadProxies: 'Proxy không hoạt động',
      pendingProxies: 'Proxy chờ xử lý',
      optimizationScore: 'Điểm tối ưu hóa',
      recommendations: 'Khuyến nghị',
      predictions: 'Dự đoán',
      lastAnalysis: 'Phân tích cuối',
      autoAnalysis: 'Tự động phân tích',
      analyzeNow: 'Phân tích ngay',
      performance: 'Hiệu suất',
      usage: 'Sử dụng',
      reliability: 'Độ tin cậy',
      improving: 'Cải thiện',
      stable: 'Ổn định',
      declining: 'Suy giảm',
      increasing: 'Tăng',
      decreasing: 'Giảm',
      criticalIssues: 'Vấn đề nghiêm trọng',
      quickActions: 'Thao tác nhanh',
      aiPowered: 'AI-powered',
      effort: 'nỗ lực',
      low: 'thấp',
      medium: 'trung bình',
      high: 'cao',
      excellent: 'Xuất sắc',
      good: 'Tốt',
      fair: 'Khá',
      needsImprovement: 'Cần cải thiện'
    },
    
    proxyList: {
      title: 'Danh sách Proxy',
      addProxy: 'Thêm Proxy',
      importProxy: 'Nhập Proxy',
      exportProxy: 'Xuất Proxy',
      testSelected: 'Test đã chọn',
      testAll: 'Test tất cả',
      deleteSelected: 'Xóa đã chọn',
      selectAll: 'Chọn tất cả',
      deselectAll: 'Bỏ chọn tất cả',
      searchPlaceholder: 'Tìm kiếm proxy...',
      noProxiesFound: 'Không tìm thấy proxy',
      noProxiesMessage: 'Bắt đầu bằng cách thêm proxy mới',
      tryDifferentFilters: 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm',
      startByAdding: 'Bắt đầu bằng cách thêm proxy mới',
      showing: 'Hiển thị',
      of: 'trong',
      proxies: 'proxy',
      selectColumn: 'Chọn',
      statusColumn: 'Trạng thái',
      typeColumn: 'Loại',
      hostPortColumn: 'Host:Port',
      credentialsColumn: 'Thông tin đăng nhập',
      performanceColumn: 'Hiệu suất',
      countryColumn: 'Quốc gia',
      anonymityColumn: 'Ẩn danh',
      notesColumn: 'Ghi chú',
      actionsColumn: 'Thao tác',
      showPassword: 'Hiện mật khẩu',
      hidePassword: 'Ẩn mật khẩu',
      copyToClipboard: 'Sao chép vào clipboard',
      noCredentials: 'Không có',
      notTested: 'Chưa test',
      testProxy: 'Test proxy',
      editProxy: 'Chỉnh sửa',
      deleteProxy: 'Xóa',
      confirmDelete: 'Bạn có chắc chắn muốn xóa proxy này?',
      confirmBulkDelete: 'Bạn có chắc chắn muốn xóa {count} proxy đã chọn?',
      cannotUndo: 'Hành động này không thể hoàn tác.',
      exportWithFilters: 'Xuất với bộ lọc',
      importFile: 'Nhập file',
      supportedFormats: 'Định dạng file không được hỗ trợ. Vui lòng chọn file .json, .csv, .txt hoặc .xml',
      importSuccess: 'Import thành công! Đã nhập {count} proxy.',
      importError: 'Lỗi: {errors}',
      fileReadError: 'Lỗi khi đọc file. Vui lòng kiểm tra định dạng file.',
      invalidFormat: 'Có lỗi xảy ra khi import file',
      addNewProxy: 'Thêm Proxy Mới',
      editProxyTitle: 'Chỉnh sửa Proxy',
      proxyDetails: 'Chi tiết Proxy',
      proxyType: 'Loại Proxy',
      proxyStatus: 'Trạng thái Proxy',
      proxyGroup: 'Nhóm Proxy',
      proxyCountry: 'Quốc gia Proxy',
      proxyAnonymity: 'Ẩn danh Proxy',
      proxyNotes: 'Ghi chú Proxy',
      saveChanges: 'Lưu thay đổi',
      cancelEdit: 'Hủy chỉnh sửa'
    },
    
    filters: {
      allStatuses: 'Tất cả trạng thái',
      allTypes: 'Tất cả loại',
      allAnonymity: 'Tất cả ẩn danh',
      allCountries: 'Tất cả quốc gia',
      allGroups: 'Tất cả nhóm',
      allPing: 'Tất cả ping',
      allSpeed: 'Tất cả tốc độ',
      advancedFilters: 'Bộ lọc nâng cao',
      clearFilters: 'Xóa bộ lọc',
      applyFilters: 'Áp dụng bộ lọc',
      filterBy: 'Lọc theo',
      status: 'Trạng thái',
      type: 'Loại',
      anonymity: 'Ẩn danh',
      country: 'Quốc gia',
      group: 'Nhóm',
      ping: 'Ping',
      speed: 'Tốc độ',
      fastPing: 'Ping nhanh',
      mediumPing: 'Ping trung bình',
      slowPing: 'Ping chậm',
      fastSpeed: 'Tốc độ nhanh',
      mediumSpeed: 'Tốc độ trung bình',
      slowSpeed: 'Tốc độ chậm'
    },
    

    
    performance: {
      title: 'Hiệu suất',
      description: 'Theo dõi hiệu suất hệ thống',
      systemPerformance: 'Hiệu suất hệ thống',
      proxyPerformance: 'Hiệu suất proxy',
      responseTime: 'Thời gian phản hồi',
      throughput: 'Thông lượng',
      errorRate: 'Tỷ lệ lỗi',
      uptime: 'Thời gian hoạt động',
      memoryUsage: 'Sử dụng bộ nhớ',
      cpuUsage: 'Sử dụng CPU',
      networkLatency: 'Độ trễ mạng',
      bandwidth: 'Băng thông',
      connections: 'Kết nối',
      activeConnections: 'Kết nối hoạt động',
      totalConnections: 'Tổng kết nối',
      failedConnections: 'Kết nối thất bại',
      successRate: 'Tỷ lệ thành công',
      averageResponseTime: 'Thời gian phản hồi trung bình',
      peakResponseTime: 'Thời gian phản hồi cao nhất',
      minResponseTime: 'Thời gian phản hồi thấp nhất',
      requestsPerSecond: 'Yêu cầu mỗi giây',
      dataTransferred: 'Dữ liệu đã truyền',
      cacheHitRate: 'Tỷ lệ cache hit',
      optimizationSuggestions: 'Gợi ý tối ưu hóa',
      performanceMetrics: 'Chỉ số hiệu suất',
      realTimeMonitoring: 'Giám sát thời gian thực',
      historicalData: 'Dữ liệu lịch sử',
      performanceReport: 'Báo cáo hiệu suất',
      exportReport: 'Xuất báo cáo',
      performanceAlerts: 'Cảnh báo hiệu suất',
      thresholdExceeded: 'Vượt ngưỡng',
      performanceDegraded: 'Hiệu suất suy giảm',
      systemOverloaded: 'Hệ thống quá tải',
      memoryLeak: 'Rò rỉ bộ nhớ',
      highLatency: 'Độ trễ cao',
      lowThroughput: 'Thông lượng thấp',
      highErrorRate: 'Tỷ lệ lỗi cao'
    },
    
    forms: {
      required: 'Trường này là bắt buộc',
      invalidFormat: 'Định dạng không hợp lệ',
      invalidEmail: 'Email không hợp lệ',
      invalidUrl: 'URL không hợp lệ',
      invalidPort: 'Port không hợp lệ',
      invalidHost: 'Host không hợp lệ',
      invalidPortRange: 'Port phải là số từ 1-65535',
      passwordTooShort: 'Mật khẩu quá ngắn',
      passwordTooLong: 'Mật khẩu quá dài',
      usernameRequired: 'Tên đăng nhập là bắt buộc',
      passwordRequired: 'Mật khẩu là bắt buộc',
      hostRequired: 'Host là bắt buộc',
      portRequired: 'Port là bắt buộc',
      typeRequired: 'Loại là bắt buộc',
      statusRequired: 'Trạng thái là bắt buộc',
      countryRequired: 'Quốc gia là bắt buộc',
      anonymityRequired: 'Ẩn danh là bắt buộc',
      groupRequired: 'Nhóm là bắt buộc',
      notesOptional: 'Ghi chú (tùy chọn)',
      saveSuccess: 'Lưu thành công',
      saveError: 'Lỗi khi lưu',
      updateSuccess: 'Cập nhật thành công',
      updateError: 'Lỗi khi cập nhật',
      deleteSuccess: 'Xóa thành công',
      deleteError: 'Lỗi khi xóa',
      validationError: 'Lỗi xác thực',
      networkError: 'Lỗi mạng',
      serverError: 'Lỗi máy chủ',
      unknownError: 'Lỗi không xác định'
    },
    
    modals: {
      confirmAction: 'Xác nhận hành động',
      confirmDelete: 'Xác nhận xóa',
      confirmBulkDelete: 'Xác nhận xóa hàng loạt',
      confirmClear: 'Xác nhận xóa tất cả',
      confirmReset: 'Xác nhận đặt lại',
      confirmExport: 'Xác nhận xuất',
      confirmImport: 'Xác nhận nhập',
      confirmTest: 'Xác nhận test',
      confirmOptimize: 'Xác nhận tối ưu hóa',
      confirmApply: 'Xác nhận áp dụng',
      confirmDismiss: 'Xác nhận bỏ qua',
      confirmReplace: 'Xác nhận thay thế',
      confirmUpdate: 'Xác nhận cập nhật',
      confirmSave: 'Xác nhận lưu',
      confirmCancel: 'Xác nhận hủy',
      confirmClose: 'Xác nhận đóng',
      confirmBack: 'Xác nhận quay lại',
      confirmNext: 'Xác nhận tiếp theo',
      confirmPrevious: 'Xác nhận trước đó',
      confirmYes: 'Xác nhận có',
      confirmNo: 'Xác nhận không',
      confirmOk: 'Xác nhận OK'
    },
    
    messages: {
      welcome: 'Chào mừng',
      welcomeMessage: 'Chào mừng đến với Proxy Manager',
      gettingStarted: 'Bắt đầu',
      gettingStartedMessage: 'Hãy bắt đầu bằng cách thêm proxy đầu tiên của bạn',
      noData: 'Không có dữ liệu',
      noDataMessage: 'Không có dữ liệu để hiển thị',
      loadingData: 'Đang tải dữ liệu',
      loadingDataMessage: 'Vui lòng chờ trong khi chúng tôi tải dữ liệu',
      errorOccurred: 'Đã xảy ra lỗi',
      errorOccurredMessage: 'Đã xảy ra lỗi không mong muốn',
      successMessage: 'Thành công',
      successMessageText: 'Thao tác đã được thực hiện thành công',
      warningMessage: 'Cảnh báo',
      warningMessageText: 'Vui lòng chú ý đến thông báo này',
      infoMessage: 'Thông tin',
      infoMessageText: 'Thông tin quan trọng cần lưu ý',
      confirmMessage: 'Xác nhận',
      confirmMessageText: 'Vui lòng xác nhận hành động này',
      errorMessage: 'Lỗi',
      errorMessageText: 'Đã xảy ra lỗi trong quá trình xử lý'
    }
  },
  
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      refresh: 'Refresh',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      apply: 'Apply',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      all: 'All',
      none: 'None',
      select: 'Select',
      selected: 'Selected',
      total: 'Total',
      actions: 'Actions',
      status: 'Status',
      type: 'Type',
      host: 'Host',
      port: 'Port',
      username: 'Username',
      password: 'Password',
      country: 'Country',
      anonymity: 'Anonymity',
      notes: 'Notes',
      performance: 'Performance',
      ping: 'Ping',
      speed: 'Speed',
      lastTested: 'Last Tested',
      group: 'Group',
      alive: 'Alive',
      dead: 'Dead',
      pending: 'Pending',
      testing: 'Testing',
      unknownStatus: 'Unknown',
      fast: 'Fast',
      medium: 'Medium',
      slow: 'Slow',
      transparent: 'Transparent',
      anonymous: 'Anonymous',
      elite: 'Elite',
      http: 'HTTP',
      https: 'HTTPS',
      socks4: 'SOCKS4',
      socks5: 'SOCKS5',
      httpConnect: 'HTTP-Connect',
      httpsConnect: 'HTTPS-Connect',
      socks4a: 'SOCKS4A',
      ssh: 'SSH',
      sshTunnel: 'SSH Tunnel',
      openvpn: 'OpenVPN',
      wireguard: 'WireGuard',
      l2tp: 'L2TP',
      pptp: 'PPTP',
      ikev2: 'IKEv2',
      residential: 'Residential',
      datacenter: 'Datacenter',
      mobile: 'Mobile',
      isp: 'ISP',
      static: 'Static',
      rotating: 'Rotating',
      ftp: 'FTP',
      smtp: 'SMTP',
      pop3: 'POP3',
      imap: 'IMAP',
      telnet: 'Telnet',
      cloudflare: 'Cloudflare',
      cloudfront: 'CloudFront',
      fastly: 'Fastly',
      tor: 'Tor',
      i2p: 'I2P',
      freenet: 'Freenet',
      gaming: 'Gaming',
      streaming: 'Streaming',
      cdn: 'CDN',
      enterprise: 'Enterprise',
      corporate: 'Corporate',
      firewall: 'Firewall',
      custom: 'Custom',
      unknown: 'Unknown',
      debug: 'Debug Storage',
      noSelection: 'Chưa chọn',
      inactive: 'Không hoạt động'
    },
    
    navigation: {
      dashboard: 'Dashboard',
      proxyList: 'Proxy List',
      optimizedList: 'Optimized List',
      performance: 'Performance',
      massValidator: 'Mass Validator',
      smartRotation: 'Smart Rotation',
      realtimeTest: 'Real-time Test',
      multitest: 'Test & URL Management',
      stats: 'Statistics & Analytics',
      settings: 'Settings',
      help: 'Help'
    },
    
    dashboard: {
      title: 'Proxy Manager',
      description: 'Professional proxy management and testing application',
      totalProxies: 'Total Proxies',
      aliveProxies: 'Alive Proxies',
      deadProxies: 'Dead Proxies',
      pendingProxies: 'Pending Proxies',
      optimizationScore: 'Optimization Score',
      recommendations: 'Recommendations',
      predictions: 'Predictions',
      lastAnalysis: 'Last Analysis',
      autoAnalysis: 'Auto Analysis',
      analyzeNow: 'Analyze Now',
      performance: 'Performance',
      usage: 'Usage',
      reliability: 'Reliability',
      improving: 'Improving',
      stable: 'Stable',
      declining: 'Declining',
      increasing: 'Increasing',
      decreasing: 'Decreasing',
      criticalIssues: 'Critical Issues',
      quickActions: 'Quick Actions',
      aiPowered: 'AI-powered',
      effort: 'effort',
      low: 'low',
      medium: 'medium',
      high: 'high',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      needsImprovement: 'Needs Improvement'
    },
    
    proxyList: {
      title: 'Proxy List',
      addProxy: 'Add Proxy',
      importProxy: 'Import Proxy',
      exportProxy: 'Export Proxy',
      testSelected: 'Test Selected',
      testAll: 'Test All',
      deleteSelected: 'Delete Selected',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      searchPlaceholder: 'Search proxies...',
      noProxiesFound: 'No proxies found',
      noProxiesMessage: 'Start by adding a new proxy',
      tryDifferentFilters: 'Try changing filters or search keywords',
      startByAdding: 'Start by adding a new proxy',
      showing: 'Showing',
      of: 'of',
      proxies: 'proxies',
      selectColumn: 'Select',
      statusColumn: 'Status',
      typeColumn: 'Type',
      hostPortColumn: 'Host:Port',
      credentialsColumn: 'Credentials',
      performanceColumn: 'Performance',
      countryColumn: 'Country',
      anonymityColumn: 'Anonymity',
      notesColumn: 'Notes',
      actionsColumn: 'Actions',
      showPassword: 'Show Password',
      hidePassword: 'Hide Password',
      copyToClipboard: 'Copy to Clipboard',
      noCredentials: 'None',
      notTested: 'Not Tested',
      testProxy: 'Test Proxy',
      editProxy: 'Edit',
      deleteProxy: 'Delete',
      confirmDelete: 'Are you sure you want to delete this proxy?',
      confirmBulkDelete: 'Are you sure you want to delete {count} selected proxies?',
      cannotUndo: 'This action cannot be undone.',
      exportWithFilters: 'Export with Filters',
      importFile: 'Import File',
      supportedFormats: 'Unsupported file format. Please select .json, .csv, .txt or .xml file',
      importSuccess: 'Import successful! Added {count} proxies.',
      importError: 'Error: {errors}',
      fileReadError: 'Error reading file. Please check file format.',
      invalidFormat: 'Error occurred while importing file',
      addNewProxy: 'Add New Proxy',
      editProxyTitle: 'Edit Proxy',
      proxyDetails: 'Proxy Details',
      proxyType: 'Proxy Type',
      proxyStatus: 'Proxy Status',
      proxyGroup: 'Proxy Group',
      proxyCountry: 'Proxy Country',
      proxyAnonymity: 'Proxy Anonymity',
      proxyNotes: 'Proxy Notes',
      saveChanges: 'Save Changes',
      cancelEdit: 'Cancel Edit'
    },
    
    filters: {
      allStatuses: 'All Statuses',
      allTypes: 'All Types',
      allAnonymity: 'All Anonymity',
      allCountries: 'All Countries',
      allGroups: 'All Groups',
      allPing: 'All Ping',
      allSpeed: 'All Speed',
      advancedFilters: 'Advanced Filters',
      clearFilters: 'Clear Filters',
      applyFilters: 'Apply Filters',
      filterBy: 'Filter by',
      status: 'Status',
      type: 'Type',
      anonymity: 'Anonymity',
      country: 'Country',
      group: 'Group',
      ping: 'Ping',
      speed: 'Speed',
      fastPing: 'Fast Ping',
      mediumPing: 'Medium Ping',
      slowPing: 'Slow Ping',
      fastSpeed: 'Fast Speed',
      mediumSpeed: 'Medium Speed',
      slowSpeed: 'Slow Speed'
    },
    

    
    performance: {
      title: 'Performance',
      description: 'System performance monitoring',
      systemPerformance: 'System Performance',
      proxyPerformance: 'Proxy Performance',
      responseTime: 'Response Time',
      throughput: 'Throughput',
      errorRate: 'Error Rate',
      uptime: 'Uptime',
      memoryUsage: 'Memory Usage',
      cpuUsage: 'CPU Usage',
      networkLatency: 'Network Latency',
      bandwidth: 'Bandwidth',
      connections: 'Connections',
      activeConnections: 'Active Connections',
      totalConnections: 'Total Connections',
      failedConnections: 'Failed Connections',
      successRate: 'Success Rate',
      averageResponseTime: 'Average Response Time',
      peakResponseTime: 'Peak Response Time',
      minResponseTime: 'Min Response Time',
      requestsPerSecond: 'Requests Per Second',
      dataTransferred: 'Data Transferred',
      cacheHitRate: 'Cache Hit Rate',
      optimizationSuggestions: 'Optimization Suggestions',
      performanceMetrics: 'Performance Metrics',
      realTimeMonitoring: 'Real-time Monitoring',
      historicalData: 'Historical Data',
      performanceReport: 'Performance Report',
      exportReport: 'Export Report',
      performanceAlerts: 'Performance Alerts',
      thresholdExceeded: 'Threshold Exceeded',
      performanceDegraded: 'Performance Degraded',
      systemOverloaded: 'System Overloaded',
      memoryLeak: 'Memory Leak',
      highLatency: 'High Latency',
      lowThroughput: 'Low Throughput',
      highErrorRate: 'High Error Rate'
    },
    
    forms: {
      required: 'This field is required',
      invalidFormat: 'Invalid format',
      invalidEmail: 'Invalid email',
      invalidUrl: 'Invalid URL',
      invalidPort: 'Invalid port',
      invalidHost: 'Invalid host',
      invalidPortRange: 'Port must be a number between 1-65535',
      passwordTooShort: 'Password too short',
      passwordTooLong: 'Password too long',
      usernameRequired: 'Username is required',
      passwordRequired: 'Password is required',
      hostRequired: 'Host is required',
      portRequired: 'Port is required',
      typeRequired: 'Type is required',
      statusRequired: 'Status is required',
      countryRequired: 'Country is required',
      anonymityRequired: 'Anonymity is required',
      groupRequired: 'Group is required',
      notesOptional: 'Notes (optional)',
      saveSuccess: 'Save successful',
      saveError: 'Save error',
      updateSuccess: 'Update successful',
      updateError: 'Update error',
      deleteSuccess: 'Delete successful',
      deleteError: 'Delete error',
      validationError: 'Validation error',
      networkError: 'Network error',
      serverError: 'Server error',
      unknownError: 'Unknown error'
    },
    
    modals: {
      confirmAction: 'Confirm Action',
      confirmDelete: 'Confirm Delete',
      confirmBulkDelete: 'Confirm Bulk Delete',
      confirmClear: 'Confirm Clear',
      confirmReset: 'Confirm Reset',
      confirmExport: 'Confirm Export',
      confirmImport: 'Confirm Import',
      confirmTest: 'Confirm Test',
      confirmOptimize: 'Confirm Optimize',
      confirmApply: 'Confirm Apply',
      confirmDismiss: 'Confirm Dismiss',
      confirmReplace: 'Confirm Replace',
      confirmUpdate: 'Confirm Update',
      confirmSave: 'Confirm Save',
      confirmCancel: 'Confirm Cancel',
      confirmClose: 'Confirm Close',
      confirmBack: 'Confirm Back',
      confirmNext: 'Confirm Next',
      confirmPrevious: 'Confirm Previous',
      confirmYes: 'Confirm Yes',
      confirmNo: 'Confirm No',
      confirmOk: 'Confirm OK'
    },
    
    messages: {
      welcome: 'Welcome',
      welcomeMessage: 'Welcome to Proxy Manager',
      gettingStarted: 'Getting Started',
      gettingStartedMessage: 'Start by adding your first proxy',
      noData: 'No Data',
      noDataMessage: 'No data to display',
      loadingData: 'Loading Data',
      loadingDataMessage: 'Please wait while we load the data',
      errorOccurred: 'Error Occurred',
      errorOccurredMessage: 'An unexpected error occurred',
      successMessage: 'Success',
      successMessageText: 'Operation completed successfully',
      warningMessage: 'Warning',
      warningMessageText: 'Please pay attention to this notice',
      infoMessage: 'Information',
      infoMessageText: 'Important information to note',
      confirmMessage: 'Confirm',
      confirmMessageText: 'Please confirm this action',
      errorMessage: 'Error',
      errorMessageText: 'An error occurred during processing'
    }
  }
}

// Hook để sử dụng translations
export function useTranslation(language: Language = 'vi') {
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key "${key}" not found for language "${language}"`)
      return key
    }
    
    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param]?.toString() || match
      })
    }
    
    return value
  }
  
  return { t, language }
}

// Context để cung cấp language cho toàn bộ app
export const LanguageContext = createContext<{
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}>({
  language: 'vi',
  setLanguage: () => {},
  t: (key: string) => key
})

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi')
  const { t } = useTranslation(language)
  
  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t } },
    children
  )
}

// Hook để sử dụng language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}