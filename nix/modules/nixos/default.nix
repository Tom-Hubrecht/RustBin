# SPDX-FileCopyrightText: 2026 Tom Hubrecht <tom.hubrecht@mail.hubrecht.ovh>
#
# SPDX-License-Identifier: EUPL-1.2

{
  config,
  lib,
  pkgs,
  utils,
  ...
}:

let
  inherit (lib)
    getExe
    mkDefault
    mkEnableOption
    mkIf
    mkOption
    mkPackageOption
    optional
    ;

  inherit (lib.types)
    bool
    ints
    nullOr
    str
    ;

  inherit (utils) escapeSystemdExecArgs;

  cfg = config.services.rustbin;
in

{
  options.services.rustbin = {
    enable = mkEnableOption "RustBin, a secure and private pastebin";

    package = mkPackageOption pkgs "rustbin" { };

    host = mkOption {
      type = str;
      description = "Domain where RustBin will be served.";
    };

    maxBodySize = mkOption {
      type = ints.positive;
      default = 16777216;
      description = "The maximum accepted size for an upload request.";
    };

    configureNginx = mkOption {
      type = bool;
      default = true;
      description = "Whether to configure Nginx as the reverse proxy";
    };

    database = {
      createLocally = mkOption {
        type = bool;
        default = true;
        description = "Create the database and database user locally using postgresql.";
      };

      uri = mkOption {
        type = nullOr str;
        default = "postgres:///?host=/run/postgresql";
        description = ''
          URI to the database.
          Can be set to null in which case RUSTBIN_DB_URI should be set through an EnvironmentFile.
        '';
      };
    };
  };

  config = mkIf cfg.enable {
    systemd.services.rustbin = {
      description = "RustBin API server";
      wantedBy = [ "multi-user.target" ];

      environment = mkIf (cfg.database.uri != null) {
        "RUSTBIN_DB_URI" = cfg.database.uri;
      };

      requires = [
        "network.target"
        "rustbin.socket"
      ]
      ++ (optional cfg.database.createLocally "postgresql.service");
      after = [ "network.target" ] ++ (optional cfg.database.createLocally "postgresql.service");

      serviceConfig = {
        User = "rustbin";
        DynamicUser = true;

        ExecStart = escapeSystemdExecArgs [
          (getExe cfg.package)
          "sd-listen"
        ];

        ProtectHostname = true;
        CapabilityBoundingSet = "";
        IPAddressDeny = "any";
        LockPersonality = true;
        MemoryDenyWriteExecute = true;
        PrivateDevices = true;
        PrivateNetwork = true;
        PrivateUsers = true;
        ProcSubset = "pid";
        ProtectClock = true;
        ProtectControlGroups = true;
        ProtectHome = true;
        ProtectKernelLogs = true;
        ProtectKernelModules = true;
        ProtectKernelTunables = true;
        ProtectProc = "invisible";
        RestrictAddressFamilies = [ "AF_UNIX" ];
        RestrictNamespaces = true;
        RestrictRealtime = true;
        SystemCallArchitectures = "native";
        SystemCallFilter = [
          "~@clock"
          "~@cpu-emulation"
          "~@debug"
          "~@module"
          "~@mount"
          "~@obsolete"
          "~@privileged"
          "~@raw-io"
          "~@reboot"
          "~@resources"
          "~@swap"
        ];
        UMask = "0777";
      };
    };

    systemd.sockets.rustbin = {
      description = "Socket for the RustBin API server";
      wantedBy = [ "sockets.target" ];

      socketConfig = {
        ListenStream = "/run/rustbin/.sock";
        SocketMode = "600";
        SocketUser = config.services.nginx.user;
      };
    };

    services.postgresql = mkIf cfg.database.createLocally {
      enable = true;

      ensureDatabases = [ "rustbin" ];
      ensureUsers = [
        {
          name = "rustbin";
          ensureDBOwnership = true;
        }
      ];
    };

    services.nginx = mkIf cfg.configureNginx {
      enable = true;

      recommendedBrotliSettings = mkDefault true;
      recommendedGzipSettings = mkDefault true;

      virtualHosts.${cfg.host} = {
        enableACME = mkDefault true;
        forceSSL = mkDefault true;

        root = cfg.package.frontend;

        locations = {
          "/".tryFiles = "$uri /index.html";

          "/api" = {
            proxyPass = "http://unix:/run/rustbin/.sock";
            recommendedProxySettings = true;
          };
        };
      };
    };
  };
}
