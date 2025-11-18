import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Printer, Share2, FileText, Download } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { GARMENT_PRICES, CUSTOMIZATION_PRICES, formatPrice, convertCurrency } from "@/utils/pricing";
import jsPDF from "jspdf";
import "jspdf-autotable";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("AWG");

  useEffect(() => {
    if (!orderNumber) {
      navigate('/');
      return;
    }

    fetchOrderData();
  }, [orderNumber]);

  const fetchOrderData = async () => {
    try {
      const response = await axios.get(`${API}/order/${orderNumber}`);
      setOrderData(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order ${orderNumber}`,
          text: `HT Activewear Order: ${orderNumber}`,
          url: url,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  const handleNewOrder = () => {
    navigate('/');
  };

  const getSizeBreakdown = (sizeBreakdown) => {
    return sizeBreakdown || '';
  };

  const calculateItemPrice = (item) => {
    const garmentPrice = GARMENT_PRICES[item['Garment Type']] || 0;
    const customizationType = orderData?.order?.['Customization Type'] || 'Printing';
    const customizationCost = CUSTOMIZATION_PRICES[customizationType] || 0;
    const totalQty = item['Total Qty'] || 0;
    return (garmentPrice + customizationCost) * totalQty;
  };

  const calculateOrderTotal = () => {
    if (!orderData || !orderData.items) return 0;
    return orderData.items.reduce((total, item) => total + calculateItemPrice(item), 0);
  };

  const generatePDF = () => {
    if (!orderData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('HT ACTIVEWEAR', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Order Receipt', pageWidth / 2, 28, { align: 'center' });

    // Order Number
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Order #${orderNumber}`, 20, 45);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(orderData.order.Timestamp).toLocaleString(), 20, 52);

    // Customer Info
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Customer Information', 20, 65);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    let yPos = 72;
    doc.text(`Name: ${orderData.order['Customer Name']}`, 20, yPos);
    yPos += 6;
    doc.text(`Email: ${orderData.order['Email']}`, 20, yPos);
    if (orderData.order['Phone']) {
      yPos += 6;
      doc.text(`Phone: ${orderData.order['Phone']}`, 20, yPos);
    }
    if (orderData.order['Notes']) {
      yPos += 6;
      doc.text(`Notes: ${orderData.order['Notes']}`, 20, yPos);
    }

    // Customization
    if (orderData.order['Customization Needed']) {
      yPos += 12;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Customization', 20, yPos);
      
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Type: ${orderData.order['Customization Type']}`, 20, yPos);
      yPos += 6;
      doc.text(`Artwork Status: ${orderData.order['Artwork Status']}${orderData.order['Artwork Status'] === 'Other' && orderData.order['Artwork Status Other'] ? ' - ' + orderData.order['Artwork Status Other'] : ''}`, 20, yPos);
      yPos += 6;
      doc.text(`Details: ${orderData.order['Customization Details']}`, 20, yPos, { maxWidth: 170 });
    }

    // Items Table
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Order Items', 20, yPos);

    yPos += 5;
    const tableData = orderData.items.map(item => {
      const garmentType = item['Garment Type'] === 'Other' ? item['Other Garment'] : item['Garment Type'];
      const color = item['Color'] === 'Custom' ? item['Custom Color'] : item['Color'];
      const sizeBreakdown = getSizeBreakdown(item['Size Breakdown']);
      const qty = item['Total Qty'];
      const price = calculateItemPrice(item);
      return [
        `${garmentType} - ${color}`,
        sizeBreakdown,
        `${qty} pcs`,
        formatPrice(currency === 'USD' ? convertCurrency(price, 'AWG', 'USD') : price, currency)
      ];
    });

    doc.autoTable({
      startY: yPos,
      head: [['Item', 'Sizes', 'Quantity', 'Price']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [17, 24, 39], textColor: 255 },
      styles: { fontSize: 9 },
    });

    // Total
    yPos = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    const total = calculateOrderTotal();
    const displayTotal = formatPrice(
      currency === 'USD' ? convertCurrency(total, 'AWG', 'USD') : total,
      currency
    );
    doc.text(`Order Total: ${displayTotal}`, 20, yPos);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Quantity: ${orderData.order['Order Total Qty']} pieces`, 20, yPos + 7);

    // Footer
    yPos = doc.internal.pageSize.height - 30;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Contact Information', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text('Indy Chan - HT Activewear', 20, yPos + 6);
    doc.text('WhatsApp/Call: (297) 594-2982', 20, yPos + 12);
    doc.text('Email: customorders@blindingmedia.com', 20, yPos + 18);

    // Save PDF
    doc.save(`HT-Activewear-Order-${orderNumber}.pdf`);
    toast.success('PDF receipt downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Button onClick={handleNewOrder}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32" data-testid="success-page">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[460px] mx-auto px-6 py-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" data-testid="success-icon" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="success-title">
              Order Received!
            </h1>
            <p className="text-base text-gray-600">Thank you for your order</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[460px] mx-auto px-6 py-6 space-y-6">
        {/* Currency Toggle */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">View Prices In</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrency("AWG")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currency === "AWG"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                AWG
              </button>
              <button
                type="button"
                onClick={() => setCurrency("USD")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currency === "USD"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>
        </div>

        {/* Order Number */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Order Number</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900" data-testid="order-number">{orderNumber}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(orderNumber)}
              className="rounded-full"
              data-testid="copy-order-number"
            >
              <FileText className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-base font-medium text-gray-900" data-testid="success-customer-name">
                {orderData.order['Customer Name']}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base font-medium text-gray-900" data-testid="success-email">
                {orderData.order['Email']}
              </p>
            </div>
            {orderData.order['Phone'] && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-base font-medium text-gray-900" data-testid="success-phone">
                  {orderData.order['Phone']}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Customization */}
        {orderData.order['Customization Needed'] && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customization</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-base font-medium text-gray-900">
                  {orderData.order['Customization Type']}
                  {orderData.order['Customization Type'] === 'Embroidery' && (
                    <span className="ml-2 text-sm text-blue-600">(+AWG 10 per item)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Artwork Status</p>
                <p className="text-base font-medium text-gray-900">
                  {orderData.order['Artwork Status']}
                  {orderData.order['Artwork Status'] === 'Other' && orderData.order['Artwork Status Other'] && (
                    <span className="text-gray-600"> - {orderData.order['Artwork Status Other']}</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Details</p>
                <p className="text-base text-gray-900" data-testid="success-customization-details">
                  {orderData.order['Customization Details']}
                </p>
              </div>
              {orderData.order['Artwork'] && (
                <div>
                  <p className="text-sm text-gray-500">Artwork</p>
                  <a
                    href={orderData.order['Artwork']}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-blue-600 hover:underline"
                    data-testid="success-artwork-link"
                  >
                    View artwork
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
          <div className="space-y-4">
            {orderData.items.map((item, index) => {
              const itemPrice = calculateItemPrice(item);
              const displayPrice = currency === 'USD' ? convertCurrency(itemPrice, 'AWG', 'USD') : itemPrice;
              
              return (
                <div
                  key={index}
                  className="pb-4 border-b border-gray-200 last:border-0 last:pb-0"
                  data-testid={`success-item-${index}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900" data-testid={`success-item-title-${index}`}>
                        {item['Garment Type'] === 'Other' ? item['Other Garment'] : item['Garment Type']} —{' '}
                        {item['Color'] === 'Custom' ? item['Custom Color'] : item['Color']}
                      </p>
                      <p className="text-sm text-gray-500 mt-1" data-testid={`success-item-sizes-${index}`}>
                        {getSizeBreakdown(item['Size Breakdown'])}
                      </p>
                      {item['Notes'] && (
                        <p className="text-sm text-gray-600 mt-1 italic" data-testid={`success-item-notes-${index}`}>
                          Note: {item['Notes']}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900" data-testid={`success-item-qty-${index}`}>
                        {item['Total Qty']} pcs
                      </p>
                      <p className="text-sm text-blue-600 font-semibold" data-testid={`success-item-price-${index}`}>
                        {formatPrice(displayPrice, currency)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Total Quantity</span>
              <span className="text-xl font-bold" data-testid="success-order-total-qty">
                {orderData.order['Order Total Qty']} pcs
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-600">
              <span className="text-lg font-semibold">Order Total</span>
              <span className="text-3xl font-bold" data-testid="success-order-total-price">
                {formatPrice(
                  currency === 'USD' 
                    ? convertCurrency(calculateOrderTotal(), 'AWG', 'USD') 
                    : calculateOrderTotal(), 
                  currency
                )}
              </span>
            </div>
            <div className="text-sm text-gray-300">
              {currency === "AWG" 
                ? `≈ ${formatPrice(calculateOrderTotal() / 1.75, "USD")}`
                : `≈ ${formatPrice(calculateOrderTotal() * 1.75, "AWG")}`
              }
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-900">
            A confirmation email has been sent to <strong>{orderData.order['Email']}</strong>.
            We'll contact you shortly to confirm your order details.
          </p>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50" data-testid="success-actions">
        <div className="max-w-[460px] mx-auto px-6 py-4 grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={handleNewOrder}
            className="h-12 text-sm font-medium rounded-full"
            data-testid="new-order-button"
          >
            New Order
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="h-12 text-sm font-medium rounded-full"
            data-testid="print-button"
          >
            <Printer className="w-4 h-4 mr-1" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="h-12 text-sm font-medium rounded-full"
            data-testid="share-button"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Success;