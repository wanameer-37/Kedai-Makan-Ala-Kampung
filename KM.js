document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;
    const menuItems = document.querySelectorAll('.menu-item input[type="number"]');
    const incrementButtons = document.querySelectorAll('.quantity-control .increment');
    const decrementButtons = document.querySelectorAll('.quantity-control .decrement');
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceSpan = document.getElementById('total-price');
    const checkoutBtn = document.getElementById('checkout-btn');
    const tableNumberInput = document.getElementById('table-number');
    const customerNameInput = document.getElementById('customer-name');
    const paymentSection = document.getElementById('payment-section');
    const cashPaymentBtn = document.getElementById('cash-payment-btn');
    const onlinePaymentBtn = document.getElementById('online-payment-btn');
    const cashPaymentForm = document.getElementById('cash-payment-form');
    const onlinePaymentForm = document.getElementById('online-payment-form');
    const receiptContentCash = document.getElementById('receipt-content-cash');
    const receiptContentOnline = document.getElementById('receipt-content');
    const downloadReceiptBtnCash = document.getElementById('download-receipt-btn-cash');
    const downloadReceiptBtnOnline = document.getElementById('download-receipt-btn');
    const newOrderBtn = document.getElementById('new-order-btn');
    const newOrderBtnOnline = document.getElementById('new-order-btn-online');
    const addOrderBtnCash = document.getElementById('add-order-btn-cash');
    const addOrderBtnOnline = document.getElementById('add-order-btn-online');
    const downloadQrBtn = document.getElementById('download-qr-btn');
    const qrImage = document.getElementById('qr-image');
    const menuCategoryBtns = document.querySelectorAll('.menu-category-btn');
    const dineInBtn = document.getElementById('dine-in');
    const takeAwayBtn = document.getElementById('take-away');
    const tableInput = document.getElementById('table-input');
    const orderTypeDiv = document.getElementById('order-type');
    const typeDisplay = document.getElementById('type-display');
    const receiptNumSpan = document.getElementById('receipt-num');
    const heroMenuBtn = document.getElementById('hero-menu-btn');

    let cart = [];
    let currentTableNumber = '';
    let currentCustomerName = '';
    let isCashPayment = false;
    let orderType = 'Dine In'; // Default to Dine In
    let receiptNumber = null;

    // Toggle menu categories
    menuCategoryBtns.forEach(button => {
        button.addEventListener('click', () => {
            menuCategoryBtns.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.dataset.category;
            document.querySelectorAll('.menu-item').forEach(item => {
                if (item.classList.contains(category)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Toggle Dine In / Take Away
    dineInBtn.addEventListener('click', () => {
        dineInBtn.classList.add('active');
        takeAwayBtn.classList.remove('active');
        orderType = 'Dine In';
        tableInput.style.display = 'block';
        orderTypeDiv.style.display = 'none';
        receiptNumSpan.textContent = '';
        typeDisplay.textContent = '';
        receiptNumber = null;
    });

    takeAwayBtn.addEventListener('click', () => {
        takeAwayBtn.classList.add('active');
        dineInBtn.classList.remove('active');
        orderType = 'Take Away';
        tableInput.style.display = 'none';
        orderTypeDiv.style.display = 'block';
        receiptNumber = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit number
        typeDisplay.textContent = orderType;
        receiptNumSpan.textContent = receiptNumber;
    });

    // Hero menu button functionality
    heroMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('menu').style.display = 'block';
        paymentSection.style.display = 'none';
        cashPaymentForm.style.display = 'none';
        onlinePaymentForm.style.display = 'none';
        receiptContentCash.innerHTML = '';
        receiptContentOnline.innerHTML = '';
        cashPaymentBtn.classList.remove('active');
        onlinePaymentBtn.classList.remove('active');
        window.scrollTo({ top: document.getElementById('menu').offsetTop, behavior: 'smooth' });
    });

    // Function to update the cart display and total price
    function updateCart() {
        cart = [];
        let total = 0;
        menuItems.forEach(input => {
            const quantity = parseInt(input.value) || 0;
            if (quantity > 0) {
                const itemId = input.dataset.id;
                const itemName = input.dataset.name;
                const itemPrice = parseFloat(input.dataset.price);
                const itemTotal = quantity * itemPrice;
                cart.push({
                    id: itemId,
                    name: itemName,
                    quantity: quantity,
                    price: itemPrice,
                    total: itemTotal
                });
                total += itemTotal;
            }
        });

        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tiada item dalam troli.</p>';
            checkoutBtn.disabled = true;
        } else {
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.innerHTML = `
                    <span class="item-name">${item.name} (x${item.quantity})</span>
                    <span>RM ${item.total.toFixed(2)}</span>
                `;
                cartItemsContainer.appendChild(itemDiv);
            });
            checkoutBtn.disabled = false;
        }

        totalPriceSpan.textContent = `RM ${total.toFixed(2)}`;
    }

    // Event listeners for quantity controls
    incrementButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const input = document.querySelector(`input[data-id="${e.target.dataset.id}"]`);
            input.value = parseInt(input.value || 0) + 1;
            updateCart();
        });
    });

    decrementButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const input = document.querySelector(`input[data-id="${e.target.dataset.id}"]`);
            if (parseInt(input.value || 0) > 0) {
                input.value = parseInt(input.value || 0) - 1;
            }
            updateCart();
        });
    });

    menuItems.forEach(input => {
        input.addEventListener('change', () => {
            if (parseInt(input.value || 0) < 0) {
                input.value = 0;
            }
            updateCart();
        });
    });

    // Input validation for customer name
    function validateInputs() {
        const nameRegex = /^[A-Za-z\s-]+$/;
        let isValid = true;

        // Validate customer name
        const customerNameError = document.getElementById('customer-name-error') || document.createElement('div');
        customerNameError.id = 'customer-name-error';
        customerNameError.className = 'error-message';
        customerNameError.style.display = 'none';
        customerNameInput.parentElement.appendChild(customerNameError);

        if (!nameRegex.test(customerNameInput.value.trim())) {
            customerNameInput.classList.add('error');
            customerNameError.textContent = 'Nama pelanggan hanya boleh mengandungi huruf, spasi, atau tanda sambung (-).';
            customerNameError.style.display = 'block';
            isValid = false;
        } else {
            customerNameInput.classList.remove('error');
            customerNameError.style.display = 'none';
        }

        return isValid;
    }

    // Initial cart update
    updateCart();

    // Checkout button click
    checkoutBtn.addEventListener('click', () => {
        currentCustomerName = customerNameInput.value.trim();

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="color: #d32f2f;">Sila pilih item sebelum meneruskan pembayaran.</p>';
            return;
        }

        if (!validateInputs()) {
            return;
        }

        currentTableNumber = orderType === 'Dine In' ? tableNumberInput.value.trim() : receiptNumber.toString();

        document.getElementById('menu').style.display = 'none';
        paymentSection.style.display = 'block';
    });

    // Payment options
    cashPaymentBtn.addEventListener('click', () => {
        isCashPayment = true;
        generateReceipt(currentCustomerName, cart, totalPriceSpan.textContent, receiptContentCash, orderType, currentTableNumber);
        paymentSection.style.display = 'block';
        cashPaymentForm.style.display = 'block';
        onlinePaymentForm.style.display = 'none';
        cashPaymentBtn.classList.add('active');
        onlinePaymentBtn.classList.remove('active');
    });

    onlinePaymentBtn.addEventListener('click', () => {
        isCashPayment = false;
        generateReceipt(currentCustomerName, cart, totalPriceSpan.textContent, receiptContentOnline, orderType, currentTableNumber);
        paymentSection.style.display = 'block';
        onlinePaymentForm.style.display = 'block';
        cashPaymentForm.style.display = 'none';
        cashPaymentBtn.classList.remove('active');
        onlinePaymentBtn.classList.add('active');
    });

    // Download QR code
    downloadQrBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = qrImage.src;
        a.download = 'qr_payment.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Generate receipt function for display
    function generateReceipt(customerName, orderItems, totalAmount, receiptContainer, orderType, numberField) {
        let receiptHtml = `
            <div class="receipt-header">
                <h3>Resit Pesanan</h3>
                <p><strong>Kedai:</strong> KEDAI MEE CELUP SEMBUR</p>
                <p><strong>Nama Pelanggan:</strong> ${customerName}</p>
                <p><strong>Tarikh:</strong> ${new Date().toLocaleDateString('ms-MY')}</p>
                <p><strong>Masa:</strong> ${new Date().toLocaleTimeString('ms-MY')}</p>
                <p><strong>Jenis Order:</strong> ${orderType}</p>
                <p><strong>${orderType === 'Dine In' ? 'No. Meja:' : 'No. Resit:'}</strong> ${numberField}</p>
                <hr>
            </div>
            <div class="receipt-body">
                <p><strong>Pesanan Anda:</strong></p>
                <table class="receipt-table">
                    <tr>
                        <th>Item</th>
                        <th>Kuantiti</th>
                        <th>Harga (RM)</th>
                    </tr>
        `;
        orderItems.forEach(item => {
            receiptHtml += `
                <tr>
                    <td>${item.name}</td>
                    <td style="text-align: right;">${item.quantity}</td>
                    <td style="text-align: right;">${item.total.toFixed(2)}</td>
                </tr>
            `;
        });
        receiptHtml += `
                </table>
            </div>
            <div class="receipt-total">
                <p><strong>Jumlah Pembayaran:</strong> ${totalAmount}</p>
            </div>
            <div class="receipt-footer">
                <p>Terima kasih kerana memilih kami!</p>
                ${isCashPayment ? '' : '<p>Sila tunjuk resit di kaunter untuk bukti pembayaran.</p>'}
            </div>
        `;
        receiptContainer.innerHTML = receiptHtml;
    }

    // Generate LaTeX content for PDF (server-side rendering option)
    function generateLatexContent(customerName, orderItems, totalAmount, orderType, numberField) {
        let latexContent = `
\\documentclass[a4paper,12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{array}
\\usepackage{booktabs}
\\usepackage{noto}
\\geometry{top=2cm,bottom=2cm,left=2cm,right=2cm}

\\begin{document}

\\begin{center}
    \\textbf{\\large Resit Pesanan}\\\\
    \\vspace{0.5cm}
    \\begin{tabular}{ll}
        \\textbf{Kedai:} & KEDAI MEE CELUP SEMBUR \\\\
        \\textbf{Nama Pelanggan:} & ${customerName.replace(/&/g, '\\&')} \\\\
        \\textbf{Tarikh:} & ${new Date().toLocaleDateString('ms-MY')} \\\\
        \\textbf{Masa:} & ${new Date().toLocaleTimeString('ms-MY')} \\\\
        \\textbf{Jenis Order:} & ${orderType} \\\\
        \\textbf{${orderType === 'Dine In' ? 'No. Meja:' : 'No. Resit:'}} & ${numberField} \\\\
    \\end{tabular}
    \\vspace{0.5cm}
    \\hrule
    \\vspace{0.5cm}
    \\textbf{Pesanan Anda:}\\\\
    \\begin{tabular}{lrr}
        \\toprule
        \\textbf{Item} & \\textbf{Kuantiti} & \\textbf{Harga (RM)} \\\\
        \\midrule
`;
        orderItems.forEach(item => {
            latexContent += `        ${item.name.replace(/&/g, '\\&')} & ${item.quantity} & ${item.total.toFixed(2)} \\\\ \n`;
        });
        latexContent += `
        \\bottomrule
        \\end{tabular}
        \\vspace{0.5cm}
        \\hrule
        \\vspace{0.5cm}
        \\textbf{Jumlah Pembayaran:} ${totalAmount}
        \\vspace{0.5cm}
        \\hrule
        \\vspace{0.5cm}
        Terima kasih kerana memilih kami!\\\\
        ${isCashPayment ? '' : 'Sila tunjuk resit di kaunter untuk bukti pembayaran.'}
\\end{center}

\\end{document}
        `;
        return latexContent;
    }

    // Download receipt as PDF (for both cash and online payments)
    function downloadReceipt() {
        const doc = new jsPDF();
        // Header
        doc.setFontSize(18);
        doc.setTextColor(0, 128, 157); // Biru cyan (#00809D)
        doc.text('Resit Pesanan', 105, 20, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.setDrawColor(211, 175, 55); // Emas muda (#D3AF37)
        doc.line(20, 25, 190, 25);

        // Restaurant and customer details
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Kedai: KEDAI MEE CELUP SEMBUR', 20, 35);
        doc.text(`Nama Pelanggan: ${currentCustomerName}`, 20, 45);
        doc.text(`Tarikh: ${new Date().toLocaleDateString('ms-MY')}`, 20, 55);
        doc.text(`Masa: ${new Date().toLocaleTimeString('ms-MY')}`, 20, 65);
        doc.text(`Jenis Order: ${orderType}`, 20, 75);
        doc.text(`${orderType === 'Dine In' ? 'No. Meja:' : 'No. Resit:'} ${currentTableNumber}`, 20, 85);
        doc.line(20, 90, 190, 90);

        // Order table
        doc.autoTable({
            startY: 95,
            head: [['Item', 'Kuantiti', 'Harga (RM)']],
            body: cart.map(item => [item.name, item.quantity, item.total.toFixed(2)]),
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 4, textColor: [0, 0, 0] },
            headStyles: { fillColor: [0, 128, 157], textColor: [255, 255, 255], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 100 },
                1: { cellWidth: 30, halign: 'right' },
                2: { cellWidth: 50, halign: 'right' }
            },
            margin: { left: 20, right: 20 }
        });

        // Total and footer
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setTextColor(255, 215, 0); // Emas terang (#FFD700)
        doc.text(`Jumlah Pembayaran: ${totalPriceSpan.textContent}`, 20, finalY);
        doc.setDrawColor(211, 175, 55); // Emas muda (#D3AF37)
        doc.line(20, finalY + 5, 190, finalY + 5);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Terima kasih kerana memilih kami!', 105, finalY + 15, { align: 'center' });
        if (!isCashPayment) {
            doc.text('Sila tunjuk resit di kaunter untuk bukti pembayaran.', 105, finalY + 25, { align: 'center' });
        }

        doc.save(`resit_${orderType.toLowerCase()}_${currentTableNumber}.pdf`);
    }

    downloadReceiptBtnCash.addEventListener('click', downloadReceipt);
    downloadReceiptBtnOnline.addEventListener('click', downloadReceipt);

    // Add more items to order (for both cash and online)
    function addOrder() {
        cashPaymentForm.style.display = 'none';
        onlinePaymentForm.style.display = 'none';
        receiptContentCash.innerHTML = '';
        receiptContentOnline.innerHTML = '';
        paymentSection.style.display = 'none';
        document.getElementById('menu').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    addOrderBtnCash.addEventListener('click', addOrder);
    addOrderBtnOnline.addEventListener('click', addOrder);

    // New order functionality (for both cash and online)
    function newOrder() {
        // Reset cart and inputs
        cart = [];
        menuItems.forEach(input => {
            input.value = 0;
        });
        customerNameInput.value = '';
        tableNumberInput.value = '';
        updateCart();

        // Reset UI state
        cashPaymentForm.style.display = 'none';
        onlinePaymentForm.style.display = 'none';
        receiptContentCash.innerHTML = '';
        receiptContentOnline.innerHTML = '';
        paymentSection.style.display = 'none';
        document.getElementById('menu').style.display = 'block';

        // Reset order type
        dineInBtn.classList.add('active');
        takeAwayBtn.classList.remove('active');
        orderType = 'Dine In';
        tableInput.style.display = 'block';
        orderTypeDiv.style.display = 'none';
        receiptNumSpan.textContent = '';
        typeDisplay.textContent = '';
        receiptNumber = null;

        // Reset error messages and styles
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.order-form input').forEach(el => {
            el.classList.remove('error');
        });

        // Reset payment options
        isCashPayment = false;
        cashPaymentBtn.classList.remove('active');
        onlinePaymentBtn.classList.remove('active');

        // Reset menu categories to default (Makanan active)
        menuCategoryBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector('.menu-category-btn[data-category="makanan"]').classList.add('active');
        document.querySelectorAll('.menu-item').forEach(item => {
            if (item.classList.contains('makanan')) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        // Scroll to top of landing page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    newOrderBtn.addEventListener('click', newOrder);
    newOrderBtnOnline.addEventListener('click', newOrder);
});
