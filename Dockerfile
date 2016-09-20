######################################################
#
# Agave ToGo Web Container Image
# Tag: agaveapi/togo
#
# This is the image hosting the static assets comprising
# Agave ToGo. SSL is supported.
#
# https://bitbucket.org/agaveapi/agave-togo
# http://togo.agaveapi.co
#
######################################################

FROM agaveapi/httpd:2.4

MAINTAINER Rion Dooley <dooley@tacc.utexas.edu>

ADD . /var/www/html

ENV DOCUMENT_ROOT /var/www/html

# enable compression and etags for caching
RUN sed -i 's/^#LoadModule deflate_module/LoadModule deflate_module/g' /etc/apache2/httpd.conf && \
    sed -i 's/^#LoadModule expires_module/LoadModule expires_module/g' /etc/apache2/httpd.conf


