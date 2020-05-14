# frozen_string_literal: true

Raven.configure do |config|
  config.dsn = ENV['SENTRY_DSN']

  # production
  config.environments = %[production]

  # defult config
  config.async = false
  config.context_lines = 3
  config.current_environment = current_environment_from_env
  config.encoding = 'gzip'
  config.environments = []
  config.exclude_loggers = []
  config.excluded_exceptions = IGNORE_DEFAULT.dup
  config.inspect_exception_causes_for_exclusion = false
  config.linecache = ::Raven::LineCache.new
  config.logger = ::Raven::Logger.new(STDOUT)
  config.open_timeout = 1
  config.processors = DEFAULT_PROCESSORS.dup
  config.project_root = detect_project_root
  config.rails_activesupport_breadcrumbs = false
  config.rails_report_rescued_exceptions = true
  config.release = detect_release
  config.sample_rate = 1.0
  config.sanitize_credit_cards = true
  config.sanitize_fields = []
  config.sanitize_fields_excluded = []
  config.sanitize_http_headers = []
  config.send_modules = true
  config.server = ENV['SENTRY_DSN']
  config.server_name = server_name_from_env
  config.should_capture = false
  config.ssl_verification = true
  config.tags = {}
  config.timeout = 2
  config.transport_failure_callback = false
  config.before_send = false
end
