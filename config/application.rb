require_relative 'boot'

require 'rails'
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'active_storage/engine'
require 'action_controller/railtie'
require 'action_mailer/railtie'
require 'action_mailbox/engine'
require 'action_text/engine'
require 'action_view/railtie'
require 'action_cable/engine'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

# Initialize dotenv before booting the main application
if Rails.env.development? || Rails.env.test?
  Dotenv::Railtie.load
end

# Sentry DSN
Raven.configure do |config|
  config.dsn = ENV['SENTRY_DSN']
  config.async = false
  config.context_lines = 3
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

module CovidVolunteers
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.0

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.

    # Don't add field_with_errors class.
    config.action_view.field_error_proc = Proc.new do |html_tag, instance|
      html_tag
    end

    # From: https://blog.alex-miller.co/rails/2017/01/07/rails-authenticity-token-and-mobile-safari.html.
    config.action_dispatch.default_headers.merge!(
      'Cache-Control' => 'no-store, no-cache'
    )

    config.time_zone = 'Pacific Time (US & Canada)'
  end
end
