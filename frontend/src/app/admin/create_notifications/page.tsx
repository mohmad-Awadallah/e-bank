// app/admin/create_notifications/page.tsx


'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    sendNotification,
    getDashboardNotifications,
    deleteNotification,
    updateNotificationMessage,
    NotificationType,
    Notification,
} from '@/services/notifications';
import getAllUser from '@/services/user';

export default function CreateNotificationsPage() {
    const router = useRouter();

    const [form, setForm] = useState({ userId: '', title: '', message: '', type: '' as NotificationType });
    const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
    const [loading, setLoading] = useState(false);

    const [users, setUsers] = useState<{ id: number; username: string }[]>([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [fetching, setFetching] = useState(false);

    // Edit modal
    const [editing, setEditing] = useState<{ id: number; message: string } | null>(null);
    const [editLoading, setEditLoading] = useState(false);

    // Load users
    useEffect(() => {
        getAllUser.getAllUsers()
            .then(setUsers)
            .catch(() => toast.error('Failed to load users'));
    }, []);

    // Sync form.userId
    useEffect(() => {
        setForm(f => ({ ...f, userId: selectedUser }));
        if (selectedUser) setErrors(e => ({ ...e, userId: '' }));
    }, [selectedUser]);

    // Fetch notifications
    useEffect(() => {
        if (!selectedUser) return;
        setFetching(true);
        getDashboardNotifications(selectedUser)
            .then(setNotifications)
            .catch(() => toast.error('Failed to load notifications'))
            .finally(() => setFetching(false));
    }, [selectedUser]);

    const handleChange = useCallback(
        (field: keyof typeof form, value: string) => {
            setForm(f => ({ ...f, [field]: value }));
            setErrors(e => ({ ...e, [field]: '' }));
        }, []
    );

    const validate = () => {
        const errs: Partial<Record<keyof typeof form, string>> = {};
        if (!form.userId) errs.userId = 'Select a recipient';
        if (!form.type) errs.type = 'Type is required';
        if (!form.title.trim()) errs.title = 'Title is required';
        if (!form.message.trim()) errs.message = 'Message is required';
        setErrors(errs);
        if (Object.keys(errs).length) {
            toast.error('Please fix form errors');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const newNotif = await sendNotification(form);
            toast.success('Notification sent!');
            if (form.userId === selectedUser) setNotifications(n => [newNotif, ...n]);
            setForm({ userId: '', title: '', message: '', type: '' as NotificationType });
        } catch {
            toast.error('Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = useCallback(async (id: number) => {
        try {
            await deleteNotification(String(id));
            setNotifications(n => n.filter(x => x.id !== id));
            toast.success('Notification deleted');
        } catch {
            toast.error('Failed to delete notification');
        }
    }, []);

    const openEdit = (n: Notification) => setEditing({ id: n.id, message: n.message });
    const closeEdit = () => setEditing(null);

    const handleEditSave = async () => {
        if (!editing) return;
        setEditLoading(true);
        try {
            const updated = await updateNotificationMessage(String(editing.id), editing.message);
            setNotifications(n => n.map(x => (x.id === updated.id ? updated : x)));
            toast.success('Message updated');
            closeEdit();
        } catch {
            toast.error('Failed to update message');
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-12 space-y-8">
            <section className="p-6 border rounded-lg shadow space-y-4">
                <h2 className="text-2xl font-semibold">View Notifications</h2>
                <Label>Select User</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger><SelectValue placeholder="Select user…" /></SelectTrigger>
                    <SelectContent>
                        {users.map(u => <SelectItem key={u.id} value={String(u.id)}>{u.username}</SelectItem>)}
                    </SelectContent>
                </Select>
                {fetching && <p className="text-gray-500">Loading notifications...</p>}
            </section>

            <section className="p-6 border rounded-lg shadow space-y-4">
                <h2 className="text-2xl font-semibold">Send Notification</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Type</Label>
                        <Select value={form.type} onValueChange={v => handleChange('type', v)}>
                            <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                            <SelectContent>
                                {Object.values(NotificationType).map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <Label>Title</Label>
                        <Input value={form.title} onChange={e => handleChange('title', e.target.value)} placeholder="Title" />
                        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <Label>Message</Label>
                        <Input value={form.message} onChange={e => handleChange('message', e.target.value)} placeholder="Message" />
                        {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
                    </div>
                </div>
                <Button variant="outline" onClick={handleSubmit} disabled={loading} className="w-full">
                    {loading ? 'Sending...' : 'Send Notification'}
                </Button>
            </section>

            <section className="p-6 border rounded-lg shadow space-y-4">
                <h2 className="text-2xl font-semibold">Notifications for {selectedUser || '...'}</h2>
                {notifications.length === 0 ? (
                    <p className="text-gray-500">No notifications.</p>
                ) : (
                    <ul className="space-y-3">
                        {notifications.map(n => (
                            <li key={n.id} className="p-4 border rounded flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{n.title}</p>
                                    <p className="text-sm">{n.message}</p>
                                    <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={() => openEdit(n)}>Edit</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(n.id)}>Delete</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Edit Dialog */}
            <Dialog open={!!editing} onOpenChange={open => { if (!open) closeEdit(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Notification</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Label>Message</Label>
                        <Input
                            value={editing?.message || ''}
                            onChange={(e) => setEditing(prev => prev ? { ...prev, message: e.target.value } : null)}
                        />
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={closeEdit}>Cancel</Button>
                        <Button variant="outline" onClick={handleEditSave} disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
